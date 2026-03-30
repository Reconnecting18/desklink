import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { registerUser, createWorkspace } from '../helpers/auth.helper';

describe('planner integration', () => {
  const app = createApp();

  async function seedProjectBoard() {
    const { accessToken } = await registerUser(app);
    const ws = await createWorkspace(app, accessToken, 'Planner WS');
    const projRes = await request(app)
      .post(`/api/workspaces/${ws.id}/projects`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'P1', description: 'd' });
    expect(projRes.status).toBe(201);
    const projectId = projRes.body.data.id;

    const boardRes = await request(app)
      .post(`/api/projects/${projectId}/boards`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Main' });
    expect(boardRes.status).toBe(201);
    const boardId = boardRes.body.data.id;

    const c1 = await request(app)
      .post(`/api/boards/${boardId}/columns`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Todo', sortOrder: 0 });
    const c2 = await request(app)
      .post(`/api/boards/${boardId}/columns`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Done', sortOrder: 1 });
    expect(c1.status).toBe(201);
    expect(c2.status).toBe(201);

    return {
      accessToken,
      workspaceId: ws.id,
      projectId,
      boardId,
      colTodo: c1.body.data.id as string,
      colDone: c2.body.data.id as string,
    };
  }

  it('full kanban workflow: project → board → columns → task → move → status', async () => {
    const ctx = await seedProjectBoard();
    const taskRes = await request(app)
      .post(`/api/projects/${ctx.projectId}/tasks`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({ title: 'Task A', columnId: ctx.colTodo });
    expect(taskRes.status).toBe(201);
    const taskId = taskRes.body.data.id as string;

    const moveRes = await request(app)
      .patch(`/api/tasks/${taskId}/move`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({ columnId: ctx.colDone, sortOrder: 0 });
    expect(moveRes.status).toBe(200);
    expect(moveRes.body.data.columnId).toBe(ctx.colDone);

    const doneRes = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({ status: 'done' });
    expect(doneRes.status).toBe(200);
    expect(doneRes.body.data.status).toBe('done');
  });

  it('projects list with pagination', async () => {
    const { accessToken } = await registerUser(app);
    const ws = await createWorkspace(app, accessToken, 'Pag WS');

    await request(app)
      .post(`/api/workspaces/${ws.id}/projects`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Alpha' });
    await request(app)
      .post(`/api/workspaces/${ws.id}/projects`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Beta' });

    const list = await request(app)
      .get(`/api/workspaces/${ws.id}/projects?page=1&limit=1`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(list.status).toBe(200);
    expect(list.body.data.data.length).toBe(1);
    expect(list.body.data.pagination.total).toBeGreaterThanOrEqual(2);
  });

  it('get board includes columns and tasks', async () => {
    const ctx = await seedProjectBoard();
    await request(app)
      .post(`/api/projects/${ctx.projectId}/tasks`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({ title: 'T1', columnId: ctx.colTodo });

    const board = await request(app)
      .get(`/api/boards/${ctx.boardId}`)
      .set('Authorization', `Bearer ${ctx.accessToken}`);
    expect(board.status).toBe(200);
    expect(board.body.data.columns.length).toBeGreaterThanOrEqual(2);
    const col0 = board.body.data.columns[0];
    expect(col0.tasks.length).toBeGreaterThanOrEqual(1);
  });

  it('delete column clears task columnId (SetNull)', async () => {
    const ctx = await seedProjectBoard();
    const taskRes = await request(app)
      .post(`/api/projects/${ctx.projectId}/tasks`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({ title: 'Orphan', columnId: ctx.colTodo });
    const taskId = taskRes.body.data.id as string;

    const del = await request(app)
      .delete(`/api/boards/${ctx.boardId}/columns/${ctx.colTodo}`)
      .set('Authorization', `Bearer ${ctx.accessToken}`);
    expect(del.status).toBe(200);

    const t = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ctx.accessToken}`);
    expect(t.status).toBe(200);
    expect(t.body.data.columnId).toBeNull();
  });

  it('tasks filter by status and priority', async () => {
    const ctx = await seedProjectBoard();
    await request(app)
      .post(`/api/projects/${ctx.projectId}/tasks`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({ title: 'High', priority: 'HIGH', columnId: ctx.colTodo });

    const filtered = await request(app)
      .get(`/api/projects/${ctx.projectId}/tasks?priority=HIGH&page=1&limit=20`)
      .set('Authorization', `Bearer ${ctx.accessToken}`);
    expect(filtered.status).toBe(200);
    expect(filtered.body.data.data.every((x: { priority: string }) => x.priority === 'HIGH')).toBe(true);
  });

  it('comments create list delete', async () => {
    const ctx = await seedProjectBoard();
    const taskRes = await request(app)
      .post(`/api/projects/${ctx.projectId}/tasks`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({ title: 'Cmt', columnId: ctx.colTodo });
    const taskId = taskRes.body.data.id as string;

    const add = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({ content: 'Hello' });
    expect(add.status).toBe(201);
    const commentId = add.body.data.id as string;

    const list = await request(app)
      .get(`/api/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${ctx.accessToken}`);
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBe(1);

    const del = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${ctx.accessToken}`);
    expect(del.status).toBe(200);
  });

  it('labels unique per task', async () => {
    const ctx = await seedProjectBoard();
    const taskRes = await request(app)
      .post(`/api/projects/${ctx.projectId}/tasks`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({ title: 'Lbl', columnId: ctx.colTodo });
    const taskId = taskRes.body.data.id as string;

    const a = await request(app)
      .post(`/api/tasks/${taskId}/labels`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({ name: 'bug', color: '#f00' });
    expect(a.status).toBe(201);

    const dup = await request(app)
      .post(`/api/tasks/${taskId}/labels`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({ name: 'bug', color: '#0f0' });
    expect(dup.status).toBe(409);
  });

  it('calendar events CRUD and date range filter', async () => {
    const ctx = await seedProjectBoard();
    const start = new Date('2026-06-01T10:00:00.000Z').toISOString();
    const end = new Date('2026-06-01T11:00:00.000Z').toISOString();

    const ev = await request(app)
      .post(`/api/projects/${ctx.projectId}/events`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({ title: 'Meet', startTime: start, endTime: end });
    expect(ev.status).toBe(201);
    const eventId = ev.body.data.id as string;

    const rangeStart = new Date('2026-06-01T00:00:00.000Z').toISOString();
    const rangeEnd = new Date('2026-06-02T00:00:00.000Z').toISOString();
    const list = await request(app)
      .get(
        `/api/projects/${ctx.projectId}/events?startDate=${encodeURIComponent(rangeStart)}&endDate=${encodeURIComponent(rangeEnd)}`,
      )
      .set('Authorization', `Bearer ${ctx.accessToken}`);
    expect(list.status).toBe(200);
    expect(list.body.data.some((e: { id: string }) => e.id === eventId)).toBe(true);

    const patch = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({ title: 'Meet2' });
    expect(patch.status).toBe(200);

    const del = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${ctx.accessToken}`);
    expect(del.status).toBe(200);
  });

  it('reorder columns', async () => {
    const ctx = await seedProjectBoard();
    const board = await request(app)
      .get(`/api/boards/${ctx.boardId}`)
      .set('Authorization', `Bearer ${ctx.accessToken}`);
    const cols = board.body.data.columns as { id: string; sortOrder: number }[];
    const reordered = [...cols].reverse().map((c, i) => ({ id: c.id, sortOrder: i }));
    const res = await request(app)
      .patch(`/api/boards/${ctx.boardId}/columns/reorder`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({ columns: reordered });
    expect(res.status).toBe(200);
  });

  it('delete project', async () => {
    const { accessToken } = await registerUser(app);
    const ws = await createWorkspace(app, accessToken, 'DelProj');
    const p = await request(app)
      .post(`/api/workspaces/${ws.id}/projects`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'ToDelete' });
    const pid = p.body.data.id as string;
    const del = await request(app)
      .delete(`/api/projects/${pid}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(del.status).toBe(200);
  });
});
