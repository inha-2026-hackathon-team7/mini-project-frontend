import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import type { MenuDetail, RestaurantDetail, RestaurantListItem } from "./types";

// 실제 백엔드 API 호출 계층. Base URL은 src/lib/http.ts (.env의 VITE_API_BASE_URL) 참고.

export const listRestaurants = () =>
  apiFetch<RestaurantListItem[]>("/restaurant/list");

export const getRestaurant = (restaurantId: number) =>
  apiFetch<RestaurantDetail>(`/restaurant/${restaurantId}`);

export const getMenu = (menuId: number) => apiFetch<MenuDetail>(`/menu/${menuId}`);

export const restaurantsQuery = () =>
  queryOptions({ queryKey: ["restaurants"], queryFn: listRestaurants, retry: false });

export const restaurantQuery = (restaurantId: number) =>
  queryOptions({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => getRestaurant(restaurantId),
    retry: false,
  });

export const menuQuery = (menuId: number) =>
  queryOptions({ queryKey: ["menu", menuId], queryFn: () => getMenu(menuId), retry: false });

export const formatWon = (amount: number) => `${(amount ?? 0).toLocaleString("ko-KR")}원`;
