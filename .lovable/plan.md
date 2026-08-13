# 배달 앱 MVP (배민 클론) — 프론트엔드 목데이터 버전

API 서버가 아직 없으므로 백엔드 없이 구현합니다. ER 다이어그램 구조를 그대로 TypeScript 타입 + 하드코딩 JSON으로 만들고, 이미지는 placeholder를 사용합니다. 나중에 실제 API가 준비되면 데이터 접근 계층만 교체하면 되도록 설계합니다.

## 데이터 모델 (ERD 그대로 타입 정의)

`src/data/types.ts` 에 ERD와 동일한 필드로 타입 정의:
`Restaurant`, `RestaurantImage`, `Menu`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`
(enum: `restaurant_images_type`, `orders_payment_type`, `orders_status`, `payments_payment_method`, `payments_status`, 금액은 정수 원 단위)

- `src/data/restaurants.json` — 식당 6곳 + 식당 이미지
- `src/data/menus.json` — 식당당 메뉴 5~8개
- 이미지: `image_url`은 placeholder URL(예: placehold.co) 사용
- 조회 함수는 `src/data/api.ts` 에 모아 Promise 반환 형태로 작성 → 추후 실제 API로 교체 용이

장바구니 / 주문 / 결제는 브라우저 localStorage에 ERD와 동일한 형태(`carts`, `cart_items`, `orders`, `order_items`, `payments`)로 저장하고, `session_id`는 최초 진입 시 UUID를 발급해 보관합니다.

## 페이지 / 라우팅

| 경로 | 화면 |
| --- | --- |
| `/` | 식당 선택 (목록, 검색, 영업중 필터) |
| `/restaurants/$restaurantId` | 식당 상세 (대표 이미지, 정보, 메뉴 목록) |
| `/restaurants/$restaurantId/menus/$menuId` | 메뉴 상세 (수량 선택, 요청사항, 담기) |
| `/cart` | 장바구니 (수량 변경/삭제, 배달비·최소주문금액 계산) |
| `/checkout` | 결제 (결제수단, 결제유형, 주문 생성) |
| `/orders` | 주문 내역 |
| `/orders/$orderId` | 주문 내역 상세 (주문 항목, 결제 정보, 상태) |

전 화면 공통 헤더에 장바구니 / 주문내역 링크를 두어 어디서든 이동 가능합니다.

## 동작 규칙 (MVP)

- 장바구니는 식당 1곳 기준. 다른 식당 메뉴를 담으면 확인 후 장바구니 교체
- 메뉴 옵션 테이블이 ERD에 없으므로 MVP는 수량 + 요청사항만 (옵션은 다음 단계)
- 결제하기 → `order` + `order_items` + `payment`(paid) 생성 → 장바구니 비우고 주문 상세로 이동
- `required_payers`는 분할 결제 선택 시 인원 수로 저장 (정산 로직은 다음 단계)

## 디자인

배민 느낌의 민트(청록) 포인트 컬러 + 밝은 배경, 모바일 우선 폭 고정 레이아웃, 카드형 리스트, 하단 고정 CTA 버튼. 모든 색은 디자인 토큰으로 정의합니다.

## 기술 노트

- TanStack Start 파일 라우팅, 조회는 TanStack Query로 감싸 추후 서버 전환 대비
- 장바구니 상태는 localStorage + Query 캐시 무효화로 동기화
- 각 라우트에 개별 `head()` 메타데이터 추가
