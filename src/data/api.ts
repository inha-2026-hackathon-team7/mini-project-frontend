import { queryOptions } from "@tanstack/react-query";
import { menus, restaurantImages, restaurants } from "./mock";
import type { Menu, Restaurant, RestaurantImage } from "./types";

// 목데이터 접근 계층. 실제 API가 준비되면 이 파일의 함수 본문만 교체하면 된다.
const delay = <T,>(value: T) => Promise.resolve(value);

export const listRestaurants = () => delay<Restaurant[]>(restaurants);

export const getRestaurant = (restaurantId: number) =>
  delay<Restaurant | undefined>(restaurants.find((r) => r.restaurant_id === restaurantId));

export const listRestaurantImages = (restaurantId: number) =>
  delay<RestaurantImage[]>(
    restaurantImages
      .filter((i) => i.restaurant_id === restaurantId)
      .sort((a, b) => a.sort_order - b.sort_order),
  );

export const listMenus = (restaurantId: number) =>
  delay<Menu[]>(menus.filter((m) => m.restaurant_id === restaurantId));

export const getMenu = (menuId: number) =>
  delay<Menu | undefined>(menus.find((m) => m.menu_id === menuId));

export const getMenusByIds = (menuIds: number[]) =>
  delay<Menu[]>(menus.filter((m) => menuIds.includes(m.menu_id)));

export const restaurantsQuery = () =>
  queryOptions({ queryKey: ["restaurants"], queryFn: listRestaurants });

export const restaurantQuery = (restaurantId: number) =>
  queryOptions({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => getRestaurant(restaurantId),
  });

export const restaurantImagesQuery = (restaurantId: number) =>
  queryOptions({
    queryKey: ["restaurant-images", restaurantId],
    queryFn: () => listRestaurantImages(restaurantId),
  });

export const menusQuery = (restaurantId: number) =>
  queryOptions({ queryKey: ["menus", restaurantId], queryFn: () => listMenus(restaurantId) });

export const menuQuery = (menuId: number) =>
  queryOptions({ queryKey: ["menu", menuId], queryFn: () => getMenu(menuId) });

export const formatWon = (amount: number) => `${amount.toLocaleString("ko-KR")}원`;
