import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient() as any;

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@desklink.io' },
    update: {},
    create: {
      email: 'demo@desklink.io',
      passwordHash,
      displayName: 'Demo User',
      role: 'ADMIN',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'alice@desklink.io' },
    update: {},
    create: {
      email: 'alice@desklink.io',
      passwordHash,
      displayName: 'Alice Johnson',
      role: 'MEMBER',
    },
  });

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      ownerId: user.id,
      members: {
        create: [
          { userId: user.id, role: 'ADMIN' },
          { userId: user2.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Create project with board
  const project = await prisma.project.create({
    data: {
      name: 'DeskLink MVP',
      description: 'Building the DeskLink productivity platform',
      workspaceId: workspace.id,
    },
  });

  const board = await prisma.board.create({
    data: {
      name: 'Sprint Board',
      projectId: project.id,
      columns: {
        create: [
          { name: 'To Do', sortOrder: 0, color: '#6366f1' },
          { name: 'In Progress', sortOrder: 1, color: '#f59e0b' },
          { name: 'In Review', sortOrder: 2, color: '#8b5cf6' },
          { name: 'Done', sortOrder: 3, color: '#22c55e' },
        ],
      },
    },
    include: { columns: true },
  });

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Set up project structure',
        description: 'Initialize the project with TypeScript, Express, and Prisma',
        status: 'done',
        priority: 'HIGH',
        projectId: project.id,
        columnId: board.columns[3].id,
        creatorId: user.id,
        assigneeId: user.id,
        sortOrder: 0,
      },
      {
        title: 'Implement authentication',
        description: 'JWT-based auth with register, login, and refresh tokens',
        status: 'done',
        priority: 'HIGH',
        projectId: project.id,
        columnId: board.columns[3].id,
        creatorId: user.id,
        assigneeId: user.id,
        sortOrder: 1,
      },
      {
        title: 'Build whiteboard module',
        description: 'Real-time collaborative whiteboard with WebSocket support',
        status: 'in_progress',
        priority: 'MEDIUM',
        projectId: project.id,
        columnId: board.columns[1].id,
        creatorId: user.id,
        assigneeId: user2.id,
        sortOrder: 0,
      },
      {
        title: 'Add file sync',
        description: 'File upload, download, versioning, and folder management',
        status: 'todo',
        priority: 'MEDIUM',
        projectId: project.id,
        columnId: board.columns[0].id,
        creatorId: user.id,
        sortOrder: 0,
      },
    ],
  });

  // Create a whiteboard
  await prisma.whiteboard.create({
    data: {
      title: 'Architecture Diagram',
      workspaceId: workspace.id,
      elements: {
        create: [
          {
            type: 'rect',
            data: { x: 100, y: 100, width: 200, height: 100, fill: '#6366f1', label: 'API Server' },
            zIndex: 0,
          },
          {
            type: 'rect',
            data: { x: 400, y: 100, width: 200, height: 100, fill: '#22c55e', label: 'Database' },
            zIndex: 1,
          },
          {
            type: 'line',
            data: { x1: 300, y1: 150, x2: 400, y2: 150, stroke: '#64748b' },
            zIndex: 2,
          },
        ],
      },
    },
  });

  // Create a document
  await prisma.document.create({
    data: {
      title: 'Project Requirements',
      type: 'DOCUMENT',
      workspaceId: workspace.id,
      content: {
        blocks: [
          { type: 'heading', content: 'DeskLink Requirements', level: 1 },
          { type: 'paragraph', content: 'DeskLink is a unified productivity platform combining whiteboard, mockups, planner, AI, documents, and file sync.' },
          { type: 'heading', content: 'Core Features', level: 2 },
          { type: 'list', items: ['Whiteboard with real-time collaboration', 'Mockup/wireframe builder', 'Task planner with kanban boards', 'AI-powered content generation', 'Document management (Word/Excel/PowerPoint)', 'File sync with versioning'] },
        ],
      },
    },
  });

  // Create a mockup
  await prisma.mockup.create({
    data: {
      title: 'Dashboard Wireframe',
      description: 'Initial wireframe for the DeskLink dashboard',
      workspaceId: workspace.id,
      screens: {
        create: [
          {
            name: 'Dashboard Home',
            width: 1440,
            height: 900,
            sortOrder: 0,
            elements: [
              { type: 'header', x: 0, y: 0, width: 1440, height: 64, content: 'DeskLink' },
              { type: 'sidebar', x: 0, y: 64, width: 240, height: 836, content: 'Navigation' },
              { type: 'card', x: 260, y: 84, width: 360, height: 200, content: 'Recent Projects' },
              { type: 'card', x: 640, y: 84, width: 360, height: 200, content: 'Recent Documents' },
            ],
          },
          {
            name: 'Task Board',
            width: 1440,
            height: 900,
            sortOrder: 1,
            elements: [
              { type: 'header', x: 0, y: 0, width: 1440, height: 64, content: 'DeskLink' },
              { type: 'column', x: 20, y: 84, width: 340, height: 796, content: 'To Do' },
              { type: 'column', x: 380, y: 84, width: 340, height: 796, content: 'In Progress' },
              { type: 'column', x: 740, y: 84, width: 340, height: 796, content: 'Done' },
            ],
          },
        ],
      },
    },
  });

  console.log('Seed complete!');
  console.log(`  Demo user: demo@desklink.io / password123`);
  console.log(`  Second user: alice@desklink.io / password123`);
  console.log(`  Workspace: ${workspace.name} (${workspace.slug})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
