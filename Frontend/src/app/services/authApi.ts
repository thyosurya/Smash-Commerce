export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  points: number;
  joinedAt?: string;
}

interface AuthResponse {
  message: string;
  token: string;
  data: ApiUser;
}

interface MeResponse {
  data: ApiUser;
}

interface ApiErrorBody {
  message?: string;
}

const AUTH_TOKEN_KEY = 'smash_commerce_token';

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function parseApiError(response: Response, fallbackMessage: string): Promise<Error> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return new Error(body.message || fallbackMessage);
  } catch {
    return new Error(fallbackMessage);
  }
}

export async function registerApi(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<AuthResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Register gagal.');
  }

  return (await response.json()) as AuthResponse;
}

export async function loginApi(payload: { email: string; password: string }): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Login gagal.');
  }

  return (await response.json()) as AuthResponse;
}

export async function meApi(token: string): Promise<MeResponse> {
  const response = await fetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Gagal mengambil profil user.');
  }

  return (await response.json()) as MeResponse;
}

export async function logoutApi(token: string): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Logout gagal.');
  }
}
