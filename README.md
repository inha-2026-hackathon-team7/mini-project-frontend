# 배달모아 — 배달의 민족 클론 (2026 해커톤 미니 프로젝트)

## 어떤 서비스를 골랐나
**배달의 민족(배민)** 을 클론했습니다. 음식점 목록을 둘러보고 → 메뉴를 장바구니에 담고 → 최소 주문금액을 채워 → 결제/주문하는, 배달 앱의 핵심 흐름을 그대로 구현한 모바일 우선 웹 앱입니다.

**주요 화면 흐름**
1. `/` — 음식점 목록 (검색 · "영업중만 보기" 필터)
2. `/restaurants/:id` — 음식점 상세 · 메뉴 목록 (+ **최소주문금액 채우기 추천**)
3. `/restaurants/:id/menus/:menuId` — 메뉴 상세 · 수량 선택 · 장바구니 담기
4. `/cart` — 장바구니 확인 · 수량 조정 · 주문하기
5. `/checkout` — 결제수단 선택 · 주문 생성
6. `/orders`, `/orders/:id` — 주문 내역 · 상세

---

## 무엇을, 왜 바꿨나 — 최소주문금액 채우기 추천

### 왜 (문제 상황)
배민을 쓰다 보면 **"최소 주문금액까지 X원 남았어요"** 라는 안내를 자주 만납니다. 하지만 정작 *"그럼 뭘 더 담아야 하지?"* 는 사용자가 직접 메뉴판을 위아래로 훑으며 가격을 계산해야 합니다. 이 순간의 마찰이 이탈로 이어지기 쉽습니다.

### 무엇을 (바꾼 점)
장바구니 합계가 최소 주문금액에 못 미치면, **부족한 금액을 채우기 좋은 메뉴를 자동으로 추천**하는 바텀 시트를 띄웠습니다. 사용자는 고민 없이 추천 카드의 **"담기"** 버튼만 누르면 최소 주문금액을 넘길 수 있습니다.

### 어떻게 동작하나
- **활성 조건**: 현재 음식점의 메뉴가 장바구니에 담겨 있고, `subtotal < 최소주문금액` 일 때 자동으로 열립니다. (닫아도 다시 미달 상태가 되면 재등장)
- **추천 알고리즘** (`src/components/MinimumOrderSheet.tsx`): 남은 금액 `remaining`을 기준으로 최대 3개를 고릅니다.
  1. **채울 수 있는 메뉴** (`price ≤ remaining`) 를 **비싼 순**으로 정렬 → 한 번에 가장 효율적으로 부족분을 메꾸는 메뉴를 우선 추천
  2. 3개가 안 되면 **초과하는 메뉴** (`price > remaining`) 를 **싼 순**으로 채워 항상 3개를 노출
  3. 채울 수 있는 메뉴가 하나도 없으면 "(더 담아야 해요)" 문구로 안내
- **결과**: "남은 금액에 가장 가까운 메뉴"를 아래(딱 맞는 것)부터, 없으면 위(살짝 넘는 것)로 제안합니다.

핵심 로직:

```30:45:src/components/MinimumOrderSheet.tsx
  // 남은 금액을 가장 효율적으로 채우는 메뉴(가격 내림차순)를 우선 추천하고,
  // 3개가 안 되면 남은 금액보다 비싼 메뉴 중 싼 순으로 채워 항상 3개를 보여준다.
  const { suggestions, allTooExpensive } = useMemo(() => {
    if (!isBelowMinimum) return { suggestions: [], allTooExpensive: false };
    const available = (restaurant.menus ?? []).filter((m) => m.available && m.price > 0);
    const affordable = available
      .filter((m) => m.price <= remaining)
      .sort((a, b) => b.price - a.price);
    const tooExpensive = available
      .filter((m) => m.price > remaining)
      .sort((a, b) => a.price - b.price);
    return {
      suggestions: [...affordable, ...tooExpensive].slice(0, SUGGESTION_LIMIT),
      allTooExpensive: affordable.length === 0,
    };
  }, [restaurant.menus, remaining, isBelowMinimum]);
```

> 최소 주문금액을 채우면 헤더의 장바구니 아이콘에 **"주문할 수 있어요!"** 힌트를 함께 노출합니다.

---

## 기술 스택
- **프레임워크**: TanStack Start (SSR) + React 19
- **라우팅**: TanStack Router (파일 기반, `src/routes/`)
- **데이터**: TanStack Query — 음식점 · 메뉴 · 장바구니 · 주문은 모두 백엔드 REST API에서 조회 (프론트 내부 목데이터 없음). 장바구니는 세션 쿠키(`credentials: "include"`)로 식별
- **UI**: Tailwind CSS v4 + shadcn/ui(Radix) · lucide-react · sonner(토스트) · vaul(추천 바텀 시트)
- **백엔드**: 별도 저장소(Spring Boot + MySQL). API 주소는 `VITE_API_BASE_URL` 환경변수로 주입

## 실행 방법
```bash
npm install
npm run dev        # http://localhost:3000
```

`.env` 에 백엔드 주소를 지정합니다. (백엔드가 실행 중이어야 데이터가 표시됩니다.)
```
VITE_API_BASE_URL=http://localhost:8080
```

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 (포트 3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier 포맷 |
