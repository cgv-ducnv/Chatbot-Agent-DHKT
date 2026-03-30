import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

/** Cookie lưu token LightRAG (ưu tiên hơn env sau khi refresh 401). */
export const LIGHT_RAG_TOKEN_COOKIE = "light_rag_access_token";

const DEFAULT_AUTH_STATUS_URL = `${process.env.NEXT_PUBLIC_LIGHT_RAG_BASE_URL}/auth-status`;

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

interface AuthStatusResponse {
  access_token?: string;
}

/** Axios tách biệt — không gắn interceptor LightRAG để tránh vòng lặp khi gọi auth-status. */
const authStatusClient = axios.create({ timeout: 30_000 });

let refreshPromise: Promise<string> | null = null;

function getBearerTokenFromStorage(): string | undefined {
  const fromEnv =
    process.env.NEXT_PUBLIC_LIGHT_RAG_BEARER_TOKEN?.trim() ||
    process.env.LIGHT_RAG_BEARER_TOKEN?.trim();
  if (typeof window === "undefined") {
    return fromEnv;
  }
  const fromCookie = Cookies.get(LIGHT_RAG_TOKEN_COOKIE)?.trim();
  return fromCookie || fromEnv;
}

function persistTokenCookie(token: string) {
  if (typeof window === "undefined") return;
  Cookies.set(LIGHT_RAG_TOKEN_COOKIE, token, {
    expires: 7,
    sameSite: "lax",
    secure:
      typeof window !== "undefined" && window.location.protocol === "https:",
  });
}

async function fetchAccessTokenFromAuthStatus(): Promise<string> {
  const url =
    process.env.NEXT_PUBLIC_LIGHT_RAG_AUTH_STATUS_URL?.trim() ||
    DEFAULT_AUTH_STATUS_URL;
  const { data } = await authStatusClient.get<AuthStatusResponse>(url);
  const token = data.access_token?.trim();
  if (!token) {
    throw new Error(
      "Kiểm tra lại auth-status: thiếu access_token trong phản hồi.",
    );
  }
  return token;
}

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = fetchAccessTokenFromAuthStatus().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * HTTP client gọi LightRAG API (RAG documents, pipeline, …).
 *
 * - **Base URL:** `NEXT_PUBLIC_LIGHT_RAG_BASE_URL` (hoặc `LIGHT_RAG_BASE_URL`)
 * - **Auth:** Bearer từ cookie `light_rag_access_token` nếu có, không thì từ env
 * - **401:** gọi `GET` auth-status (mặc định `NEXT_PUBLIC_LIGHT_RAG_AUTH_STATUS_URL`), lưu token vào cookie và thử lại request một lần
 *
 * ⚠️ Nên chỉ gọi từ **server** (Route Handler, Server Action, …) nếu không muốn token lộ;
 * hiện `documentsService` dùng từ client — cookie là `SameSite=lax`, không httpOnly.
 */
function createLightRagClient(): AxiosInstance {
  const baseURL =
    process.env.NEXT_PUBLIC_LIGHT_RAG_BASE_URL?.trim() ||
    process.env.LIGHT_RAG_BASE_URL?.trim();

  const client = axios.create({
    baseURL: baseURL || undefined,
  });

  client.interceptors.request.use((config) => {
    const token = getBearerTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const config = error.config as RetryableConfig | undefined;

      if (status !== 401 || !config || config._retry) {
        return Promise.reject(error);
      }

      config._retry = true;

      try {
        const token = await refreshAccessToken();
        persistTokenCookie(token);
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
        return client.request(config);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    },
  );

  return client;
}

/** Singleton axios instance cho toàn bộ LightRAG. */
export const lightRagApi = createLightRagClient();

export function getLightRagBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_LIGHT_RAG_BASE_URL?.trim() ||
    process.env.LIGHT_RAG_BASE_URL ||
    ""
  );
}
