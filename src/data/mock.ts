import type { Menu, Restaurant, RestaurantImage } from "./types";

const NOW = "2026-01-01T00:00:00.000Z";

const ph = (text: string, size = "600x400", bg = "1FC7B6") =>
  `https://placehold.co/${size}/${bg}/ffffff?text=${encodeURIComponent(text)}`;

export const restaurants: Restaurant[] = [
  {
    restaurant_id: 1,
    name: "청춘 국물떡볶이",
    description: "매콤한 국물떡볶이와 바삭한 튀김을 하는 분식집",
    minimum_order_amount: 12000,
    delivery_fee: 3000,
    is_open: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    restaurant_id: 2,
    name: "동네 치킨공방",
    description: "매일 아침 손질하는 국내산 생닭, 겉바속촉 후라이드",
    minimum_order_amount: 18000,
    delivery_fee: 2000,
    is_open: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    restaurant_id: 3,
    name: "미도리 초밥",
    description: "당일 입고 생선으로 만드는 합리적인 가격의 초밥",
    minimum_order_amount: 20000,
    delivery_fee: 3500,
    is_open: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    restaurant_id: 4,
    name: "화덕피자 오분",
    description: "500도 화덕에서 5분 만에 굽는 나폴리 스타일 피자",
    minimum_order_amount: 16000,
    delivery_fee: 2500,
    is_open: false,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    restaurant_id: 5,
    name: "할매 순댓국",
    description: "24시간 고아낸 진한 사골 육수 순댓국 전문",
    minimum_order_amount: 10000,
    delivery_fee: 2000,
    is_open: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    restaurant_id: 6,
    name: "라멘 야시장",
    description: "직접 뽑은 면과 12시간 돈코츠 육수",
    minimum_order_amount: 14000,
    delivery_fee: 3000,
    is_open: true,
    created_at: NOW,
    updated_at: NOW,
  },
];

export const restaurantImages: RestaurantImage[] = restaurants.flatMap((r, i) => [
  {
    image_id: i * 2 + 1,
    restaurant_id: r.restaurant_id,
    image_url: ph(`Restaurant ${r.restaurant_id}`, "800x500"),
    type: "thumbnail" as const,
    sort_order: 0,
    created_at: NOW,
  },
  {
    image_id: i * 2 + 2,
    restaurant_id: r.restaurant_id,
    image_url: ph(`Restaurant ${r.restaurant_id} Interior`, "800x500", "0F766E"),
    type: "detail" as const,
    sort_order: 1,
    created_at: NOW,
  },
]);

const menuSeed: Array<[number, string, string, number]> = [
  [1, "국물떡볶이", "매콤달콤한 국물에 쫄깃한 밀떡", 6500],
  [1, "로제떡볶이", "부드러운 크림과 매콤함의 조합", 8000],
  [1, "모둠튀김", "오징어, 고구마, 김말이 8조각", 5500],
  [1, "순대 한접시", "찹쌀순대와 모둠내장", 6000],
  [1, "치즈김밥", "고소한 모짜렐라가 듬뿍", 4500],

  [2, "후라이드 치킨", "국내산 생닭 한 마리 바삭 튀김", 19000],
  [2, "양념 치킨", "직접 만든 매콤달콤 양념 소스", 21000],
  [2, "간장마늘 치킨", "짭조름한 간장 베이스에 통마늘", 21000],
  [2, "치킨무 추가", "새콤한 국산 무 200g", 1000],
  [2, "감자튀김", "겉바속촉 두툼한 웨지감자", 5000],
  [2, "콜라 1.25L", "시원한 탄산음료", 3000],

  [3, "모둠초밥 10P", "연어, 광어, 새우 등 인기 10종", 21000],
  [3, "연어초밥 8P", "노르웨이산 생연어", 19000],
  [3, "회덮밥", "신선한 모둠회와 특제 초장", 15000],
  [3, "우동", "가쓰오 국물 우동", 7000],
  [3, "새우튀김 5P", "통새우 바삭 튀김", 9000],

  [4, "마르게리따", "토마토, 모짜렐라, 바질", 16000],
  [4, "고르곤졸라", "꿀을 곁들인 진한 치즈피자", 19000],
  [4, "페퍼로니", "매콤한 페퍼로니 듬뿍", 18000],
  [4, "루꼴라 프로슈토", "생햄과 루꼴라의 조화", 23000],
  [4, "감자 포카치아", "화덕에 구운 부드러운 빵", 8000],

  [5, "순댓국", "진한 사골 육수와 찹쌀순대", 10000],
  [5, "내장탕", "잡내 없는 손질 내장 가득", 11000],
  [5, "수육 소", "부드러운 삼겹수육 1인분", 16000],
  [5, "공기밥", "갓 지은 흰쌀밥", 1000],
  [5, "김치만두", "직접 빚은 손만두 8개", 6000],

  [6, "돈코츠 라멘", "12시간 끓인 진한 돼지육수", 11000],
  [6, "미소 라멘", "고소한 된장 베이스", 11500],
  [6, "마제소바", "국물 없는 비빔라멘", 12000],
  [6, "차슈덮밥", "불향 가득 차슈와 반숙란", 9500],
  [6, "교자 5P", "바삭하게 구운 일본식 만두", 6000],
];

export const menus: Menu[] = menuSeed.map(([restaurantId, name, description, price], i) => ({
  menu_id: i + 1,
  restaurant_id: restaurantId,
  name,
  description,
  price,
  image_url: ph(`Menu ${i + 1}`, "400x300", i % 2 === 0 ? "1FC7B6" : "0F766E"),
  is_available: true,
  created_at: NOW,
  updated_at: NOW,
}));
