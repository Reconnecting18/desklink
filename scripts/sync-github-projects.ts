type ProjectSyncMode = "dry-run" | "apply";

type Env = {
  githubToken: string;
  projectOwner: string;
  projectNumber: number;
  repoOwner: string;
  repoName: string;
  statusFieldName: string;
  doneOptionName: string;
  updatedSinceDays: number;
  mode: ProjectSyncMode;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function optionalEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

function parseIntEnv(name: string, fallback: number): number {
  const raw = optionalEnv(name);
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) throw new Error(`Invalid integer for ${name}: ${raw}`);
  return n;
}

function parseMode(raw: string | undefined): ProjectSyncMode {
  if (!raw) return "dry-run";
  if (raw === "dry-run" || raw === "apply") return raw;
  throw new Error(`Invalid SYNC_MODE: ${raw} (expected "dry-run" or "apply")`);
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

async function gql<T>(token: string, query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "desklink-project-sync",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub GraphQL HTTP ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) {
    throw new Error(`GitHub GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  if (!json.data) throw new Error("GitHub GraphQL response missing data");
  return json.data;
}

async function getProject(env: Env): Promise<{
  projectId: string;
  statusFieldId: string;
  doneOptionId: string;
}> {
  const query = /* GraphQL */ `
    query GetProject($owner: String!, $number: Int!) {
      user(login: $owner) {
        projectV2(number: $number) {
          id
          fields(first: 100) {
            nodes {
              __typename
              ... on ProjectV2Field {
                id
                name
              }
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
      organization(login: $owner) {
        projectV2(number: $number) {
          id
          fields(first: 100) {
            nodes {
              __typename
              ... on ProjectV2Field {
                id
                name
              }
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  type Node =
    | { __typename: "ProjectV2Field"; id: string; name: string }
    | {
        __typename: "ProjectV2SingleSelectField";
        id: string;
        name: string;
        options: Array<{ id: string; name: string }>;
      };

  const data = await gql<{
    user: null | { projectV2: null | { id: string; fields: { nodes: Node[] } } };
    organization: null | { projectV2: null | { id: string; fields: { nodes: Node[] } } };
  }>(env.githubToken, query, { owner: env.projectOwner, number: env.projectNumber });

  const project = data.organization?.projectV2 ?? data.user?.projectV2;
  if (!project) throw new Error(`Project not found for ${env.projectOwner} #${env.projectNumber}`);

  const statusField = project.fields.nodes.find(
    (n) => n.__typename === "ProjectV2SingleSelectField" && n.name === env.statusFieldName,
  ) as Extract<Node, { __typename: "ProjectV2SingleSelectField" }> | undefined;

  if (!statusField) {
    throw new Error(
      `Could not find single-select field "${env.statusFieldName}" on project #${env.projectNumber}`,
    );
  }

  const doneOption = statusField.options.find((o) => o.name === env.doneOptionName);
  if (!doneOption) {
    throw new Error(
      `Could not find option "${env.doneOptionName}" in field "${env.statusFieldName}"`,
    );
  }

  return { projectId: project.id, statusFieldId: statusField.id, doneOptionId: doneOption.id };
}

async function listClosedIssuesWithProjectItems(env: Env): Promise<
  Array<{
    issueId: string;
    number: number;
    title: string;
    projectItems: Array<{ itemId: string; projectId: string; statusOptionId?: string }>;
  }>
> {
  const since = daysAgoISO(env.updatedSinceDays);

  const query = /* GraphQL */ `
    query ListIssues($owner: String!, $name: String!, $cursor: String, $since: DateTime!) {
      repository(owner: $owner, name: $name) {
        issues(first: 50, after: $cursor, orderBy: { field: UPDATED_AT, direction: DESC }) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            number
            title
            state
            updatedAt
            projectItems(first: 20) {
              nodes {
                id
                project {
                  id
                }
                fieldValues(first: 20) {
                  nodes {
                    __typename
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      field {
                        ... on ProjectV2SingleSelectField {
                          id
                          name
                        }
                      }
                      optionId
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  type IssueNode = {
    id: string;
    number: number;
    title: string;
    state: "OPEN" | "CLOSED";
    updatedAt: string;
    projectItems: {
      nodes: Array<{
        id: string;
        project: { id: string };
        fieldValues: {
          nodes: Array<{
            __typename: string;
            optionId?: string;
            field?: { id: string; name: string };
          }>;
        };
      }>;
    };
  };

  const out: Array<{
    issueId: string;
    number: number;
    title: string;
    projectItems: Array<{ itemId: string; projectId: string; statusOptionId?: string }>;
  }> = [];

  let cursor: string | null = null;
  let keepGoing = true;

  while (keepGoing) {
    const data: {
      repository: {
        issues: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: IssueNode[];
        };
      };
    } = await gql(env.githubToken, query, {
      owner: env.repoOwner,
      name: env.repoName,
      cursor,
      since,
    });

    const issues = data.repository.issues.nodes;
    for (const issue of issues) {
      if (issue.updatedAt < since) {
        keepGoing = false;
        break;
      }
      if (issue.state !== "CLOSED") continue;
      if (!issue.projectItems.nodes.length) continue;

      const projectItems = issue.projectItems.nodes.map((pi: IssueNode["projectItems"]["nodes"][number]) => {
        const statusValue = pi.fieldValues.nodes.find((fv: IssueNode["projectItems"]["nodes"][number]["fieldValues"]["nodes"][number]) => {
          return (
            fv.__typename === "ProjectV2ItemFieldSingleSelectValue" && fv.field?.name === env.statusFieldName
          );
        });
        return {
          itemId: pi.id,
          projectId: pi.project.id,
          statusOptionId: statusValue?.optionId,
        };
      });

      out.push({
        issueId: issue.id,
        number: issue.number,
        title: issue.title,
        projectItems,
      });
    }

    const { hasNextPage, endCursor }: { hasNextPage: boolean; endCursor: string | null } =
      data.repository.issues.pageInfo;
    cursor = endCursor;
    keepGoing = keepGoing && hasNextPage;
  }

  return out;
}

async function setStatus(env: Env, input: { projectId: string; itemId: string; fieldId: string; optionId: string }) {
  const mutation = /* GraphQL */ `
    mutation UpdateStatus(
      $projectId: ID!
      $itemId: ID!
      $fieldId: ID!
      $optionId: String!
    ) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { singleSelectOptionId: $optionId }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
  `;

  await gql(env.githubToken, mutation, input);
}

async function main() {
  const env: Env = {
    githubToken: requireEnv("GITHUB_TOKEN"),
    projectOwner: requireEnv("PROJECT_OWNER"),
    projectNumber: parseIntEnv("PROJECT_NUMBER", NaN),
    repoOwner: requireEnv("REPO_OWNER"),
    repoName: requireEnv("REPO_NAME"),
    statusFieldName: optionalEnv("STATUS_FIELD_NAME") ?? "Status",
    doneOptionName: optionalEnv("DONE_OPTION_NAME") ?? "Done",
    updatedSinceDays: parseIntEnv("UPDATED_SINCE_DAYS", 30),
    mode: parseMode(optionalEnv("SYNC_MODE")),
  };

  if (!Number.isFinite(env.projectNumber)) {
    throw new Error(`Invalid PROJECT_NUMBER: ${process.env.PROJECT_NUMBER ?? ""}`);
  }

  const { projectId, statusFieldId, doneOptionId } = await getProject(env);
  const closedIssues = await listClosedIssuesWithProjectItems(env);

  const targets = closedIssues.flatMap((issue) =>
    issue.projectItems
      .filter((pi) => pi.projectId === projectId)
      .map((pi) => ({
        issueNumber: issue.number,
        issueTitle: issue.title,
        itemId: pi.itemId,
        currentOptionId: pi.statusOptionId,
      })),
  );

  const needsUpdate = targets.filter((t) => t.currentOptionId !== doneOptionId);

  console.log(
    JSON.stringify(
      {
        project: { owner: env.projectOwner, number: env.projectNumber },
        repo: { owner: env.repoOwner, name: env.repoName },
        mode: env.mode,
        scannedClosedIssues: closedIssues.length,
        projectItemsOnThisProject: targets.length,
        itemsNeedingUpdate: needsUpdate.length,
      },
      null,
      2,
    ),
  );

  for (const t of needsUpdate) {
    const msg = `#${t.issueNumber} → set ${env.statusFieldName}=${env.doneOptionName}`;
    if (env.mode === "dry-run") {
      console.log(`[dry-run] ${msg}`);
      continue;
    }
    console.log(`[apply] ${msg}`);
    await setStatus(env, { projectId, itemId: t.itemId, fieldId: statusFieldId, optionId: doneOptionId });
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
