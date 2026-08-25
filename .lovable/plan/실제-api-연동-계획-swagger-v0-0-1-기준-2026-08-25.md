# 실제 API 연동 계획 (Swagger v0.0.1 기준)

명세를 확인했습니다. **식당 / 메뉴 / 장바구니**는 API가 준비되어 있고, **주문·결제 API는 아직 없습니다.** 따라서 이번 단계는 "준비된 3개 영역은 실제 API로 교체, 주문/결제는 기존 로컬 방식 유지"로 진행합니다.

## Base URL 변경 위치

`.env` 파일의 한 줄만 바꾸면 됩니다.

```
VITE_API_BASE_URL=http://localhost:8080
```

- 배포 시: 이 값을 실제 서버 주소(예: `https://api.example.com`)로 변경
- 코드에서는 `src/lib/http.ts` 한 곳에서만 이 값을 읽으므로 다른 파일은 손댈 필요 없음
- 값이 없으면 `http://localhost:8080`을 기본값으로 사용

## 세션 처리

명세상 장바구니는 **세션 쿠키 기반**이므로, 모든 요청에 `credentials: "include"`를 붙여 서버가 발급한 세션 쿠키를 주고받습니다. 클라이언트에서 UUID를 발급하던 기존 방식(`bm.session_id`)은 제거합니다.

서버 쪽에서 CORS 설정이 필요합니다(프론트 도메인 허용 + `allowCredentials: true`). 이 설정이 없으면 장바구니가 매 요청마다 새로 생성됩니다.

## API 매핑

| 화면 | 사용할 API |
| --- | --- |
| 식당 목록 `/` | `GET /restaurant/list` |
| 식당 상세 | `GET /restaurant/{restaurantId}` (이미지·메뉴 포함, 한 번에 조회) |
| 메뉴 상세 | `GET /menu/{menuId}` |
| 장바구니 조회 | `GET /cart` |
| 담기 | `POST /cart/items` (`clearExisting`으로 다른 식당 교체 처리) |
| 수량 변경 | `PATCH /cart/items/{cartItemId}` |
| 항목 삭제 | `DELETE /cart/items/{cartItemId}` |
| 비우기 | `DELETE /cart` |

응답 필드는 camelCase(`restaurantId`, `open`, `available`)이므로 기존 snake_case 타입을 API DTO 기준으로 다시 정의합니다.

## 주문·결제 (API 미제공 → 현행 유지)

`/checkout`, `/orders`, `/orders/{id}`에 해당하는 API가 명세에 없습니다. 이 부분은 지금처럼 localStorage 기반으로 남겨두고, 결제 시 장바구니 데이터를 서버에서 읽어와 주문을 로컬 생성한 뒤 `DELETE /cart`로 서버 장바구니를 비웁니다. 주문 API가 추가되면 그때 교체합니다.

## 부족한 API 정리 (백엔드 요청 목록)

- `POST /order` — 주문 생성 (장바구니 → 주문)
- `GET /order/list` — 주문 내역 목록
- `GET /order/{orderId}` — 주문 상세 (주문 항목 + 결제 정보)
- `POST /payment` 또는 주문 생성에 결제수단 포함 — 결제 처리
- (선택) 주문 상태 변경/조회 — cooking, delivering 등 상태 표현용

## 구현 작업

1. `.env` + `src/lib/http.ts` — base URL과 공통 fetch 래퍼(`credentials: "include"`, 에러 처리) 작성
2. `src/data/types.ts` — API DTO 기준 타입으로 교체 (주문/결제 타입은 유지)
3. `src/data/api.ts` — 목데이터 대신 실제 fetch 호출 + Query 옵션 갱신
4. `src/lib/cart.ts` (신규) — 장바구니 API 호출 함수 + Query 옵션
5. `src/lib/store.ts` — 장바구니 관련 로컬 로직 제거, 주문/결제만 남김
6. 각 라우트 컴포넌트를 새 필드명/쿼리에 맞춰 수정, 장바구니 변경 후 `invalidateQueries`로 동기화
7. `src/data/mock.ts` 삭제
8. 서버 미실행 시 화면이 깨지지 않도록 각 화면에 에러/빈 상태 표시

## 기술 노트

- 모든 API 호출은 브라우저에서 실행(SSR에서 localhost 호출 불가)하도록 라우트 loader의 사전 fetch를 걷어내고 컴포넌트 쿼리로 처리
- 서버가 꺼져 있으면 "서버에 연결할 수 없습니다" 안내 표시
