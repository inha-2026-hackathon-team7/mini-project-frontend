import { queryOptions } from "@tanstack/react-query";
import type {
  CheckoutResponse,
  OrderCreateRequest,
  OrderCreateResponse,
  OrderDetail,
  OrderListItem,
} from "@/data/types";
import { apiFetch } from "./http";

// 백엔드 /orders* API 연동 계층. 세션 쿠키(장바구니) 기반으로 주문을 생성/조회한다.

export const ORDERS_QUERY_KEY = ["orders"] as const;

export const fetchOrders = async () =>
  (await apiFetch<OrderListItem[] | null>("/orders")) ?? [];

export const fetchOrderDetail = (orderId: number) =>
  apiFetch<OrderDetail>(`/orders/${orderId}`);

export const fetchCheckout = () => apiFetch<CheckoutResponse>("/orders/checkout");

export const createOrder = (body: OrderCreateRequest) =>
  apiFetch<OrderCreateResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const ordersQuery = () =>
  queryOptions({ queryKey: ORDERS_QUERY_KEY, queryFn: fetchOrders, retry: false });

export const orderQuery = (orderId: number) =>
  queryOptions({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderDetail(orderId),
    retry: false,
  });

export const checkoutQuery = () =>
  queryOptions({ queryKey: ["checkout"], queryFn: fetchCheckout, retry: false });
