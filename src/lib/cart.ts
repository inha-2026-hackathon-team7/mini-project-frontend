import { queryOptions } from "@tanstack/react-query";
import type { CartResponse } from "@/data/types";
import { apiFetch } from "./http";

export const EMPTY_CART: CartResponse = {
  cartId: null,
  restaurantId: null,
  restaurantName: null,
  minimumOrderAmount: 0,
  deliveryFee: 0,
  subtotal: 0,
  totalAmount: 0,
  remainingAmount: 0,
  canOrder: false,
  items: [],
};

const normalize = (cart: CartResponse | null): CartResponse =>
  cart ? { ...EMPTY_CART, ...cart, items: cart.items ?? [] } : EMPTY_CART;

export const fetchCart = async () => normalize(await apiFetch<CartResponse | null>("/cart"));

export const addCartItem = async (input: {
  menuId: number;
  quantity: number;
  clearExisting?: boolean;
}) =>
  normalize(
    await apiFetch<CartResponse>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ clearExisting: false, ...input }),
    }),
  );

export const updateCartItemQuantity = async (cartItemId: number, quantity: number) =>
  normalize(
    await apiFetch<CartResponse>(`/cart/items/${cartItemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }),
  );

export const removeCartItem = async (cartItemId: number) =>
  normalize(await apiFetch<CartResponse>(`/cart/items/${cartItemId}`, { method: "DELETE" }));

export const clearCart = async () =>
  normalize(await apiFetch<CartResponse>("/cart", { method: "DELETE" }));

export const cartQuery = () =>
  queryOptions({ queryKey: ["cart"], queryFn: fetchCart, retry: false });

export const CART_QUERY_KEY = ["cart"] as const;
