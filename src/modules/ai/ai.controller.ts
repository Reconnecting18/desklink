import { Request, Response } from 'express';
import * as aiService from './ai.service';

export async function summarize(req: Request, res: Response) {
  const result = await aiService.summarize(req.user!.userId, req.body);
  res.json({ success: true, data: result });
}

export async function generate(req: Request, res: Response) {
  const result = await aiService.generate(req.user!.userId, req.body);
  res.json({ success: true, data: result });
}

export async function suggest(req: Request, res: Response) {
  const result = await aiService.suggest(req.user!.userId, req.body);
  res.json({ success: true, data: result });
}

export async function getHistory(req: Request, res: Response) {
  const result = await aiService.getHistory(req.user!.userId);
  res.json({ success: true, data: result });
}
