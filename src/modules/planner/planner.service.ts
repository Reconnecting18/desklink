import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors';
import { paginate, paginatedResponse } from '../../shared/pagination';
import type { PaginationQuery } from '../../shared/pagination';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateBoardInput,
  CreateColumnInput,
  UpdateColumnInput,
  ReorderColumnsInput,
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
  CreateCommentInput,
  CreateLabelInput,
  CreateEventInput,
  UpdateEventInput,
  ListTasksQuery,
  ListEventsQuery,
} from './planner.schema';

// =====================
// Projects
// =====================

export async function createProject(workspaceId: string, input: CreateProjectInput) {
  return prisma.project.create({
    data: {
      ...input,
      workspaceId,
    },
  });
}

export async function listProjects(workspaceId: string, query: PaginationQuery) {
  const { skip, take } = paginate(query);
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: { workspaceId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.count({ where: { workspaceId } }),
  ]);
  return paginatedResponse(projects, total, query);
}

export async function getProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { boards: true },
  });
  if (!project) {
    throw new NotFoundError('Project');
  }
  return project;
}

export async function updateProject(projectId: string, input: UpdateProjectInput) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new NotFoundError('Project');
  }
  return prisma.project.update({
    where: { id: projectId },
    data: input,
  });
}

export async function deleteProject(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new NotFoundError('Project');
  }
  await prisma.project.delete({ where: { id: projectId } });
}

// =====================
// Boards
// =====================

export async function createBoard(projectId: string, input: CreateBoardInput) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new NotFoundError('Project');
  }
  return prisma.board.create({
    data: {
      ...input,
      projectId,
    },
  });
}

export async function listBoards(projectId: string) {
  return prisma.board.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getBoard(boardId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      columns: {
        orderBy: { sortOrder: 'asc' },
        include: {
          tasks: {
            orderBy: { sortOrder: 'asc' },
            include: {
              assignee: {
                select: { id: true, email: true, displayName: true, avatarUrl: true },
              },
              labels: true,
              _count: { select: { comments: true } },
            },
          },
        },
      },
    },
  });
  if (!board) {
    throw new NotFoundError('Board');
  }
  return board;
}

export async function deleteBoard(boardId: string) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    throw new NotFoundError('Board');
  }
  await prisma.board.delete({ where: { id: boardId } });
}

// =====================
// Columns
// =====================

export async function createColumn(boardId: string, input: CreateColumnInput) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    throw new NotFoundError('Board');
  }
  return prisma.boardColumn.create({
    data: {
      name: input.name,
      color: input.color,
      sortOrder: input.sortOrder ?? 0,
      boardId,
    },
  });
}

export async function updateColumn(columnId: string, input: UpdateColumnInput) {
  const column = await prisma.boardColumn.findUnique({ where: { id: columnId } });
  if (!column) {
    throw new NotFoundError('Column');
  }
  return prisma.boardColumn.update({
    where: { id: columnId },
    data: input,
  });
}

export async function deleteColumn(columnId: string) {
  const column = await prisma.boardColumn.findUnique({ where: { id: columnId } });
  if (!column) {
    throw new NotFoundError('Column');
  }
  await prisma.boardColumn.delete({ where: { id: columnId } });
}

export async function reorderColumns(boardId: string, input: ReorderColumnsInput) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    throw new NotFoundError('Board');
  }
  await prisma.$transaction(
    input.columns.map((col) =>
      prisma.boardColumn.update({
        where: { id: col.id },
        data: { sortOrder: col.sortOrder },
      }),
    ),
  );
  return prisma.boardColumn.findMany({
    where: { boardId },
    orderBy: { sortOrder: 'asc' },
  });
}

// =====================
// Tasks
// =====================

export async function createTask(projectId: string, creatorId: string, input: CreateTaskInput) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new NotFoundError('Project');
  }
  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      columnId: input.columnId,
      assigneeId: input.assigneeId,
      projectId,
      creatorId,
      sortOrder: 0,
    },
  });
}

export async function listTasks(projectId: string, query: ListTasksQuery) {
  const { skip, take } = paginate(query);
  const where: any = { projectId };
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.assigneeId) where.assigneeId = query.assigneeId;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: {
          select: { id: true, email: true, displayName: true, avatarUrl: true },
        },
      },
    }),
    prisma.task.count({ where }),
  ]);
  return paginatedResponse(tasks, total, query);
}

export async function getTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      labels: true,
      assignee: {
        select: { id: true, email: true, displayName: true, avatarUrl: true },
      },
      _count: { select: { comments: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      },
    },
  });
  if (!task) {
    throw new NotFoundError('Task');
  }
  return task;
}

export async function updateTask(taskId: string, input: UpdateTaskInput) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new NotFoundError('Task');
  }
  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...input,
      dueDate: input.dueDate !== undefined ? new Date(input.dueDate) : undefined,
    },
  });
}

export async function deleteTask(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new NotFoundError('Task');
  }
  await prisma.task.delete({ where: { id: taskId } });
}

export async function moveTask(taskId: string, input: MoveTaskInput) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new NotFoundError('Task');
  }
  return prisma.task.update({
    where: { id: taskId },
    data: {
      columnId: input.columnId,
      sortOrder: input.sortOrder,
    },
  });
}

// =====================
// Comments
// =====================

export async function createComment(taskId: string, authorId: string, input: CreateCommentInput) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new NotFoundError('Task');
  }
  return prisma.comment.create({
    data: {
      content: input.content,
      taskId,
      authorId,
    },
  });
}

export async function listComments(taskId: string) {
  return prisma.comment.findMany({
    where: { taskId },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });
}

export async function deleteComment(commentId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    throw new NotFoundError('Comment');
  }
  await prisma.comment.delete({ where: { id: commentId } });
}

// =====================
// Labels
// =====================

export async function createLabel(taskId: string, input: CreateLabelInput) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new NotFoundError('Task');
  }
  return prisma.taskLabel.create({
    data: {
      name: input.name,
      color: input.color,
      taskId,
    },
  });
}

export async function deleteLabel(labelId: string) {
  const label = await prisma.taskLabel.findUnique({ where: { id: labelId } });
  if (!label) {
    throw new NotFoundError('Label');
  }
  await prisma.taskLabel.delete({ where: { id: labelId } });
}

// =====================
// Events
// =====================

export async function createEvent(projectId: string, input: CreateEventInput) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new NotFoundError('Project');
  }
  return prisma.calendarEvent.create({
    data: {
      title: input.title,
      description: input.description,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      allDay: input.allDay ?? false,
      projectId,
    },
  });
}

export async function listEvents(projectId: string, query: ListEventsQuery) {
  const where: any = { projectId };
  if (query.startDate) {
    where.startTime = { ...where.startTime, gte: new Date(query.startDate) };
  }
  if (query.endDate) {
    where.endTime = { ...where.endTime, lte: new Date(query.endDate) };
  }
  return prisma.calendarEvent.findMany({
    where,
    orderBy: { startTime: 'asc' },
  });
}

export async function updateEvent(eventId: string, input: UpdateEventInput) {
  const event = await prisma.calendarEvent.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new NotFoundError('Event');
  }
  return prisma.calendarEvent.update({
    where: { id: eventId },
    data: {
      ...input,
      startTime: input.startTime ? new Date(input.startTime) : undefined,
      endTime: input.endTime ? new Date(input.endTime) : undefined,
    },
  });
}

export async function deleteEvent(eventId: string) {
  const event = await prisma.calendarEvent.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new NotFoundError('Event');
  }
  await prisma.calendarEvent.delete({ where: { id: eventId } });
}
