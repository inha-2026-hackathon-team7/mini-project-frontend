# 실제 API 연동 계획

API 서버 + swagger 명세가 완성되어 기존 목데이터/로컬 저장 계층을 실제 API로 교체한다. 인증은 없고 서버 발급 `session_id`로 사용자(세션)별 데이터를 식별한다.

## 전달 방식
- swagger `api-docs` JSON을 채팅에 직접 붙여넣는다 → 다음 세션에서 그 명세를 파싱해 엔드포인트 맵을 구성한다.

## 현재 구조 (교체 대상)
- `src/data/api.ts` — 식당/메뉴/이미지 조회를 목데이터로 반환 (Promise 형태). 교체 포인트.
- `src/lib/store.ts` — cart / cart_items / orders / order_items / payments를 localStorage에 저장. `session_id`는 `bm.session_id` 키로 이미 발급 중. 교체 포인트.
- `src/hooks/use-store.ts` — localStorage 구독 훅. 서버 전환 후 쿼리 캐시/무효화 기반으로 대체 검토.

## 연동 원칙
- 데이터 접근은 모두 `src/data/api.ts`와 `src/lib/store.ts` 양 끝에 집중 → 함수 본문만 fetch 호출로 교체. 라우트/컴포넌트는 거의 그대로 유지.
- `session_id`: 클라이언트에서 발급하던 UUID를 서버 발급 값으로 전환. 최초 진입 시 API에서 세션을 발급(또는 기존 키 재사용)하고, 이후 모든 요청에 `session_id`를 파라미터/헤더로 실어 보낸다. 명세 확인 후 정확한 전달 위치 확정.
- TanStack Query 캐시키는 그대로 유지하고, 장바구니/주문 변경 후 `queryClient.invalidateQueries`로 동기화.
- 금액은 정수 원 단위 유지(ERD 일치). 서버 응답 필드명이 다르면 매핑 레이어 추가.
- API 베이스 URL은 환경 변수(`VITE_API_BASE_URL`)로 관리.

## 작업 단계 (swagger 제공 후)
1. 명세 파싱 → 엔드포인트/요청/응답 스키마 정리, `src/data/types.ts`와 필드 매핑 확인(불일치 시 매핑/조정).
2. `src/data/api.ts` 본문을 fetch 호출로 교체 (식당 목록/상세/이미지/메뉴/메뉴상세).
3. `src/lib/store.ts`를 서버 호출 기반으로 교체: 장바구니 조회/추가/수량변경/삭제, 주문 생성, 결제 생성, 주문 내역 조회. 로컬 저장 제거.
4. `session_id` 발급·전달 로직을 서버 기반으로 전환 (최초 1회 API 호출로 발급, 이후 요청마다 첨부).
5. `use-store.ts`를 Query 기반 구독으로 조정 또는 단순화.
6. 결제 시 더치페이(분할결제)는 이미 제외됨 → `payment_type`/`required_payers` 단일 결제로 고정되어 있는지 확인.

## 기능 격차 검토 (다음 세션에서 병행)
- 현재 웹에 구현된 기능(식당 목록/검색/영업중필터, 식당 상세, 메뉴 상세+수량+요청사항, 장바구니, 결제, 주문 내역/상세)을 API 엔드포인트와 대조.
- API에 없는 기능, 웹에 없는 API 기능(예: 영업시간, 별점, 리뷰, 메뉴 옵션, 배달 추적 등)을 정리 → MVP에 포함할지 결정.
- 결과를 계획에 반영하여 부족 기능 보강 또는 명세 기준으로 웹 기능 정리.
