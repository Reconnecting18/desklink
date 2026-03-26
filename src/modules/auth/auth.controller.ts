import { Request, Response } from 'express';
import * as authService from './auth.service';

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
}

export async function refresh(req: Request, res: Response) {
  const result = await authService.refresh(req.body.refreshToken);
  res.json({ success: true, data: result });
}

export async function getMe(req: Request, res: Response) {
  const user = await authService.getProfile(req.user!.userId);
  res.json({ success: true, data: user });
}

export async function updateMe(req: Request, res: Response) {
  const user = await authService.updateProfile(req.user!.userId, req.body);
  res.json({ success: true, data: user });
}
