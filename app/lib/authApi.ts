// app/lib/authApi.ts
import apiClient from './apiClient';

export async function login(email: string, password: string) {
  const { data } = await apiClient.post('/api/auth/login', {
    email,
    password,
  });
  return data; // TokenResponse { token, id, email, name, avatar }
}

export async function signup(email: string, password: string, name: string) {
  const { data } = await apiClient.post('/api/auth/signup', {
    email,
    password,
    name,
  });
  return data; // User
}
