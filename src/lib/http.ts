/**
 * 백엔드 API 공통 fetch 래퍼.
 *
 * ▶ Base URL 변경 위치: 프로젝트 루트의 `.env` 파일
 *     VITE_API_BASE_URL=http://localhost:8080   (로컬)
 *     VITE_API_BASE_URL=https://api.example.com (배포)
 *   코드에서 이 값을 읽는 곳은 아래 API_BASE_URL 한 곳뿐입니다.
 */
export const API_BASE_URL =
  import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      // 서버가 발급한 세션 쿠키를 항상 주고받는다 (장바구니 세션 식별용)
      credentials: "include",
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("서버에 연결할 수 없습니다. API 서버가 실행 중인지 확인해 주세요.");
  }

  if (!res.ok) {
    throw new ApiError(`요청을 처리하지 못했습니다. (${res.status})`, res.status);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}
