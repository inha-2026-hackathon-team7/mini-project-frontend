# 배달 앱 MVP (배민 클론)

ER 다이어그램 그대로 데이터 모델을 만들고, 요청한 7개 페이지와 라우팅 흐름을 최소 기능으로 구현합니다. 로그인은 ERD에 없으므로(session_id 기반) 브라우저 세션 ID로 장바구니/주문을 식별합니다.

## 백엔드 (Lovable Cloud)

ERD 테이블을 그대로 생성합니다: `restaurants`, `restaurant_images`, `menus`, `carts`, `cart_items`, `orders`, `order_items`, `payments`.

- enum: `restaurant_images_type_enum`(thumbnail/detail), `orders_payment_type_enum`(single/split), `orders_status_enum`(pending/paid/cooking/delivering/completed/cancelled), `payments_payment_method_enum`(card/transfer/cash), `payments_status_enum`(pending/paid/failed)
- 금액은 ERD대로 정수(원 단위)
- 로그인이 없으므로 공개 읽기 정책 + `session_id` 기반 쓰기 정책으로 시작 (익명 접근 허용)
- 마이그레이션에 식당 6곳, 식당당 메뉴 5~8개, 이미지 시드 데이터를 INSERT로 포함해 첫 화면부터 내용이 보이게 함

## 페이지 / 라우팅

| 경로 | 화면 |
| --- | --- |
| `/` | 식당 선택 (목록, 검색, 영업중 필터) |
| `/restaurants/$restaurantId` | 식당 상세 (이미지, 정보, 메뉴 목록) |
| `/restaurants/$restaurantId/menus/$menuId` | 메뉴 상세 (수량/옵션 선택 후 담기) |
| `/cart` | 장바구니 (수량 변경, 삭제, 배달비·최소주문금액 계산) |
| `/checkout` | 결제 (결제수단, 결제유형, 주문 생성) |
| `/orders` | 주문 내역 |
| `/orders/$orderId` | 주문 내역 상세 (주문 항목, 결제 정보, 상태) |

전 화면 공통 헤더에 장바구니 / 주문내역 링크를 두어 어디서든 이동 가능하게 합니다.

## 동작 규칙 (MVP)

- 장바구니는 식당 1곳 기준. 다른 식당 메뉴를 담으면 확인 후 장바구니 교체
- 메뉴 옵션은 ERD에 테이블이 없으므로 MVP에서는 수량 + 요청사항만 (옵션 테이블은 다음 단계)
- 결제하기 → `orders` + `order_items` + `payments`(paid) 생성 → 장바구니 비우고 주문 상세로 이동
- `required_payers`는 결제 유형이 분할일 때 인원 수로 저장 (실제 분할 정산 로직은 다음 단계)

## 디자인

배민 느낌의 민트(청록) 포인트 컬러 + 밝은 배경, 모바일 우선 폭 고정 레이아웃, 카드형 리스트, 하단 고정 CTA 버튼. 모든 색은 디자인 토큰으로 정의합니다.

## 기술 노트

- TanStack Start 파일 라우팅, 데이터 조회는 loader `ensureQueryData` + `useSuspenseQuery`
- 세션 ID는 localStorage에 UUID로 보관 후 `carts.session_id` / `orders.session_id`에 사용
- 각 라우트에 개별 `head()` 메타데이터 추가
