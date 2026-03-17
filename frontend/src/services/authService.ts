import type { RegisterPayload, LoginPayload, AuthResponse, Customer } from '@/types/Customer';

const API_BASE = 'http://localhost:8080/api/auth';

// 🔹 Register
export async function registerCustomer(payload: RegisterPayload): Promise<Customer> {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Registration failed');
  }

  return response.json();
}

// 🔹 Login
export async function loginCustomer(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Invalid email or password. Please check');
  }

  const data = await response.json();

  // ✅ store token
  localStorage.setItem('token', data.token);

  return data;
}

// 🔹 Logout (optional)
export function logout() {
  localStorage.removeItem('token');
}

// 🔹 Get token
export function getToken() {
  return localStorage.getItem('token');
}