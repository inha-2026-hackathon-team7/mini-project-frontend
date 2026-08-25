import type { Order, OrderItem, Payment, PaymentMethod } from "@/data/types";

// 주문/결제 API가 아직 없어 브라우저 localStorage를 임시 저장소로 사용한다.
// 주문 API가 추가되면 이 파일을 API 호출로 교체하면 된다.
const KEYS = {
  orders: "bm.orders",
  orderItems: "bm.order_items",
  payments: "bm.payments",
} as const;

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("bm-store-change"));
}

export const subscribeStore = (listener: () => void) => {
  if (!isBrowser()) return () => {};
  window.addEventListener("bm-store-change", listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("bm-store-change", listener);
    window.removeEventListener("storage", listener);
  };
};

const now = () => new Date().toISOString();

export const getOrders = () =>
  read<Order[]>(KEYS.orders, []).sort((a, b) => b.order_id - a.order_id);
export const getOrderItems = (orderId: number) =>
  read<OrderItem[]>(KEYS.orderItems, []).filter((i) => i.order_id === orderId);
export const getPaymentByOrder = (orderId: number) =>
  read<Payment[]>(KEYS.payments, []).find((p) => p.order_id === orderId) ?? null;
export const getOrder = (orderId: number) =>
  read<Order[]>(KEYS.orders, []).find((o) => o.order_id === orderId) ?? null;

export function createOrder(input: {
  restaurantId: number;
  restaurantName: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  items: Array<{ menu_id: number; menu_name: string; menu_price: number; quantity: number }>;
}): Order {
  const orderId = Date.now();
  const order: Order = {
    order_id: orderId,
    restaurant_id: input.restaurantId,
    restaurant_name: input.restaurantName,
    payment_type: "single",
    status: "paid",
    required_payers: 1,
    total_amount: input.totalAmount,
    ordered_at: now(),
    updated_at: now(),
  };
  write(KEYS.orders, [...read<Order[]>(KEYS.orders, []), order]);

  const orderItems: OrderItem[] = input.items.map((it, idx) => ({
    order_item_id: orderId + idx + 1,
    order_id: orderId,
    ...it,
  }));
  write(KEYS.orderItems, [...read<OrderItem[]>(KEYS.orderItems, []), ...orderItems]);

  const payment: Payment = {
    payment_id: orderId + 1,
    order_id: orderId,
    payment_method: input.paymentMethod,
    paid_amount: input.totalAmount,
    status: "paid",
    created_at: now(),
    updated_at: now(),
  };
  write(KEYS.payments, [...read<Payment[]>(KEYS.payments, []), payment]);

  return order;
}
