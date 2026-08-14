# My Food Order

배달의 민족 클론 웹 서비스를 만든 후 자체적으로 몇몇 기능을 추가하려고 해. 먼저 다음과 같은 구조를 최소한의 MVP로 구현해 줘.

### 필요한 페이지

- 식당 선택 페이지

- 식당 상세 페이지 (메뉴, 식당 정보)

- 메뉴 상세 페이지 (옵션 선택, 상세 정보)

- 장바구니 페이지

- 결제 페이지

- 주문 내역 페이지

- 주문 내역 상세 페이지

### 라우팅 흐름

- 초기 화면: 식당 선택 페이지

- 식당 선택 페이지 -> 식당 상세 페이지 -> 메뉴 상세 페이지

- 모든 화면 -> 장바구니 -> 결제

- 모든 화면 -> 주문 내역 -> 주문 내역 상세

---
데이터 ER 다이어그램을 추가했어. 이 다이어그램을 바탕으로 데이터 모델을 설계하고 사용해 줘.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/681944dd-932c-4ea6-84e8-c6bf3f2e3917).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
