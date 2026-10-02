const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

type ApiError = {
  detail?: string;
};

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";

    try {
      const data = (await response.json()) as ApiError;
      if (data.detail) message = data.detail;
    } catch {
      // Keep the generic message when the API does not return JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function registerUser(payload: RegisterPayload) {
  return request<{ id: number; name: string; email: string; age: number }>(
    "/users",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function loginUser(payload: LoginPayload) {
  return request<{ message: string }>("/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutUser() {
  return request<{ message: string }>("/users/logout", {
    method: "POST",
  });
}

export function getCurrentUser() {
  return request<{
    message: string;
    user_id: number;
    email: string;
    name: string;
  }>("/test-auth");
}
