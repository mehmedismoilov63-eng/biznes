const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1";

function getStoredUserId(): string | null {
  // sessionStorage is per-tab — prevents cross-account pollution on shared browser
  if (typeof sessionStorage !== "undefined") {
    const uid = sessionStorage.getItem("bj_uid");
    if (uid) return uid;
  }
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem("bj_auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { user?: { id?: string } } };
    return parsed?.state?.user?.id ?? null;
  } catch {
    return null;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
};

type ApiError = {
  status: number;
  message: string;
};

class ApiClient {
  private readonly base: string;

  constructor(base: string) {
    this.base = base;
  }

  async request<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const { method = "GET", body, token } = options;

    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const userId = getStoredUserId();
    if (userId) headers["X-User-Id"] = userId;

    const res = await fetch(`${this.base}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    if (!res.ok) {
      const error: ApiError = { status: res.status, message: "Xatolik yuz berdi" };
      try {
        const json = (await res.json()) as { message?: string; detail?: string };
        error.message = json.message ?? json.detail ?? error.message;
      } catch {
        // ignore parse errors
      }
      throw error;
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  get<T>(path: string, token?: string): Promise<T> {
    return this.request<T>(path, { token });
  }

  post<T>(path: string, body?: unknown, token?: string): Promise<T> {
    return this.request<T>(path, { method: "POST", body, token });
  }

  patch<T>(path: string, body?: unknown, token?: string): Promise<T> {
    return this.request<T>(path, { method: "PATCH", body, token });
  }

  delete<T>(path: string, token?: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE", token });
  }

  async upload(path: string, file: File): Promise<{ path: string; originalName: string; mimeType: string; size: number }> {
    const formData = new FormData();
    formData.append("file", file);
    const uploadHeaders: Record<string, string> = {};
    const uid = getStoredUserId();
    if (uid) uploadHeaders["X-User-Id"] = uid;

    const res = await fetch(`${this.base}${path}`, {
      method: "POST",
      headers: uploadHeaders,
      body: formData,
      credentials: "include",
    });

    if (!res.ok) throw { status: res.status, message: "Fayl yuklashda xato" };
    return res.json();
  }
}

export const api = new ApiClient(API_BASE);
export const API_ORIGIN = API_BASE.replace("/api/v1", "");

export function resolveMedia(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("data:") || path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_ORIGIN}${path}`;
}
