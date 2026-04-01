import { config } from '../../config';
import { prisma } from '../../config/database';
import type { AIProvider } from './ai.provider';
import { ClaudeAdapter } from './claude.adapter';
import { MockAdapter } from './mock.adapter';
import type { SummarizeInput, GenerateInput, SuggestInput } from './ai.schema';

let provider: AIProvider | null = null;

function getProvider(): AIProvider {
  if (!provider) {
    if (config.AI_PROVIDER === 'claude' && config.ANTHROPIC_API_KEY) {
      provider = new ClaudeAdapter(config.ANTHROPIC_API_KEY);
    } else {
      provider = new MockAdapter();
    }
  }
  return provider;
}

function parseJson(value: string | null | undefined): any {
  if (value == null) return null;
  try { return JSON.parse(value); } catch { return value; }
}

function withParsedAiFields<T extends { input: string; output: string | null }>(
  req: T
): T & { input: any; output: any } {
  return { ...req, input: parseJson(req.input), output: parseJson(req.output) };
}

export async function summarize(userId: string, input: SummarizeInput) {
  const startTime = Date.now();
  const aiProvider = getProvider();

  const request = await prisma.aiRequest.create({
    data: {
      type: 'summarize',
      input: JSON.stringify(input),
      status: 'pending',
      userId,
      workspaceId: input.workspaceId,
    },
  });

  try {
    const summary = await aiProvider.summarize(input.content, {
      contentType: input.contentType,
      maxLength: input.maxLength,
    });

    const durationMs = Date.now() - startTime;
    await prisma.aiRequest.update({
      where: { id: request.id },
      data: { output: JSON.stringify({ summary }), status: 'completed', durationMs },
    });

    return { summary, requestId: request.id };
  } catch (err) {
    await prisma.aiRequest.update({
      where: { id: request.id },
      data: { status: 'failed', durationMs: Date.now() - startTime },
    });
    throw err;
  }
}

export async function generate(userId: string, input: GenerateInput) {
  const startTime = Date.now();
  const aiProvider = getProvider();

  const request = await prisma.aiRequest.create({
    data: {
      type: 'generate',
      input: JSON.stringify(input),
      status: 'pending',
      userId,
      workspaceId: input.workspaceId,
    },
  });

  try {
    const content = await aiProvider.generate(input.prompt, {
      type: input.type,
      context: input.context,
    });

    const durationMs = Date.now() - startTime;
    await prisma.aiRequest.update({
      where: { id: request.id },
      data: { output: JSON.stringify({ content }), status: 'completed', durationMs },
    });

    return { content, requestId: request.id };
  } catch (err) {
    await prisma.aiRequest.update({
      where: { id: request.id },
      data: { status: 'failed', durationMs: Date.now() - startTime },
    });
    throw err;
  }
}

export async function suggest(userId: string, input: SuggestInput) {
  const startTime = Date.now();
  const aiProvider = getProvider();

  const request = await prisma.aiRequest.create({
    data: {
      type: 'suggest',
      input: JSON.stringify(input),
      status: 'pending',
      userId,
      workspaceId: input.workspaceId,
    },
  });

  try {
    const suggestions = await aiProvider.suggest({
      type: input.context.type,
      data: input.context.data,
    });

    const durationMs = Date.now() - startTime;
    await prisma.aiRequest.update({
      where: { id: request.id },
      data: { output: JSON.stringify({ suggestions }), status: 'completed', durationMs },
    });

    return { suggestions, requestId: request.id };
  } catch (err) {
    await prisma.aiRequest.update({
      where: { id: request.id },
      data: { status: 'failed', durationMs: Date.now() - startTime },
    });
    throw err;
  }
}

export async function getHistory(userId: string) {
  const requests = await prisma.aiRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return requests.map(withParsedAiFields);
}
