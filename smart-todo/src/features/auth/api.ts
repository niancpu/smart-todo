import type { AuthResponse, AuthTokens } from '@/types/auth';
import { httpClient } from '@/lib/http';

const API_BASE = 'http://115.190.1.69:3000';

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || 'Login failed');
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function registerApi(username: string, email: string, code: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || 'Registration failed');
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function refreshApi(refreshToken: string): Promise<AuthTokens> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error('Token refresh failed');
  const json = await res.json();
  return json.data ?? json;
}

export async function logoutApi(accessToken: string, refreshToken: string): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function sendCodeApi(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || '发送验证码失败');
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function sendRegisterCodeApi(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/send-register-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || '发送验证码失败');
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function loginWithCodeApi(email: string, code: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login-with-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || '验证码登录失败');
  }
  const json = await res.json();
  return json.data ?? json;
}

// --- Profile APIs (authenticated) ---

export interface ProfileResponse {
  id: string;
  email: string;
  username: string;
  hasPassword: boolean;
}

export function getProfileApi() {
  return httpClient.get<ProfileResponse>('/auth/profile');
}

export function updateUsernameApi(username: string) {
  return httpClient.patch<{ id: string; email: string; username: string }>('/auth/profile', { username });
}

export function sendChangeEmailCodeApi(newEmail: string) {
  return httpClient.post<{ message: string }>('/auth/send-change-email-code', { newEmail });
}

export function changeEmailApi(newEmail: string, code: string) {
  return httpClient.post<{ id: string; email: string; username: string }>('/auth/change-email', { newEmail, code });
}

export function setPasswordApi(newPassword: string, currentPassword?: string) {
  return httpClient.post<{ message: string }>('/auth/set-password', { newPassword, currentPassword });
}
