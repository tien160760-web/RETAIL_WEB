/**
 * Cấu hình tập trung địa chỉ Backend API và xử lý thống nhất phản hồi HTTP 401 / 403
 * (Mục 2.1 - Issue #14: Xây dựng khu vực quản trị)
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const API_BASE_URL = rawBaseUrl ? rawBaseUrl.replace(/\/+$/, '') : '';
export const API_V1_URL = `${API_BASE_URL}/api/v1`;

export const TOKEN_STORAGE_KEY = 'retail_jwt_token';
export const USER_EMAIL_STORAGE_KEY = 'retail_admin_email';

export interface ApiErrorResult {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

type AuthEventCallback = (info: { status: 401 | 403; message: string }) => void;

let authEventListener: AuthEventCallback | null = null;

export function onApiAuthError(listener: AuthEventCallback | null) {
  authEventListener = listener;
}

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null, email?: string | null) {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    if (email !== undefined) {
      if (email) {
        sessionStorage.setItem(USER_EMAIL_STORAGE_KEY, email);
      } else {
        sessionStorage.removeItem(USER_EMAIL_STORAGE_KEY);
      }
    }
  } catch {
    // ignore storage errors
  }
}

export function buildAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function parseApiError(res: Response): Promise<ApiErrorResult> {
  const body = await res.json().catch(() => null);
  const code =
    body?.error?.code ||
    `HTTP_${res.status}`;
  const message =
    body?.error?.message ||
    body?.detail ||
    (res.status === 401
      ? 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn (401). Vui lòng đăng nhập lại.'
      : res.status === 403
        ? 'Bạn không có quyền thực hiện thao tác quản trị này (403 Forbidden).'
        : `Yêu cầu thất bại (Mã lỗi ${res.status}).`);

  return {
    status: res.status,
    code,
    message,
    details: body?.error?.details ?? null,
  };
}

/**
 * Wrapper fetch gọi tới Backend API, tự động đính kèm JWT Bearer Token
 * và kích hoạt sự kiện xử lý khi gặp mã lỗi 401 (Unauthorized) hoặc 403 (Forbidden).
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  suppressAuthEvent = false
): Promise<{ ok: true; status: number; data: T } | { ok: false; status: number; error: ApiErrorResult }> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : endpoint.startsWith('/api') || endpoint.startsWith('/health')
      ? `${API_BASE_URL}${endpoint}`
      : `${API_V1_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = buildAuthHeaders(
    (options.headers as Record<string, string>) || {}
  );

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.ok) {
    const data = (await response.json().catch(() => ({}))) as T;
    return { ok: true, status: response.status, data };
  }

  const apiErr = await parseApiError(response);

  if (!suppressAuthEvent && (response.status === 401 || response.status === 403)) {
    authEventListener?.({
      status: response.status as 401 | 403,
      message: apiErr.message,
    });
  }

  return {
    ok: false,
    status: response.status,
    error: apiErr,
  };
}
