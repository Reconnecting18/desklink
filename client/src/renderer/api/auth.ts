import apiClient from './client'
import type { User } from '@/stores/authStore'

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

interface RegisterResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiClient.post('/auth/login', { email, password })
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  return apiClient.post('/auth/register', { name, email, password })
}

export async function getMe(): Promise<User> {
  return apiClient.get('/auth/me')
}

export async function updateProfile(data: { name?: string; avatarUrl?: string }): Promise<User> {
  return apiClient.patch('/auth/me', data)
}
