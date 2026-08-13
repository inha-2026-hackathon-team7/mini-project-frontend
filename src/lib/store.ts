import type {
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderPaymentType,
  Payment,
  PaymentMethod,
} from "@/data/types";

// 브라우저 localStorage를 임시 저장소로 사용한다 (API 서버 준비 전).
const KEYS = {
  session: "bm.session_id",
  cart: "bm.cart",
  cartItems: "bm.cart_items",
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

export function getSessionId(): string {
  if (!isBrowser()) return "";
  let id = window.localStorage.getItem(KEYS.session);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEYS.session, id);
  }
  return id;
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

export const getCart = () => read<Cart | null>(KEYS.cart, null);
export const getCartItems = () => read<CartItem[]>(KEYS.cartItems, []);

export function clearCart() {
  write(KEYS.cart, null);
  write(KEYS.cartItems, []);
}

export function addToCart(restaurantId: number, menuId: number, quantity: number) {
  const cart = getCart();
  let items = getCartItems();

  if (!cart || cart.restaurant_id !== restaurantId) {
    const newCart: Cart = {
      cart_id: Date.now(),
      session_id: getSessionId(),
      restaurant_id: restaurantId,
      created_at: now(),
      updated_at: now(),
    };
    write(KEYS.cart, newCart);
    items = [];
  }

  const cartId = (getCart() as Cart).cart_id;
  const existing = items.find((i) => i.menu_id === menuId);
  if (existing) {
    existing.quantity += quantity;
    existing.updated_at = now();
  } else {
    items.push({
      cart_item_id: Date.now() + Math.floor(Math.random() * 1000),
      cart_id: cartId,
      menu_id: menuId,
      quantity,
      created_at: now(),
      updated_at: now(),
    });
  }
  write(KEYS.cartItems, items);
}

export function updateCartItemQuantity(cartItemId: number, quantity: number) {
  let items = getCartItems();
  if (quantity <= 0) {
    items = items.filter((i) => i.cart_item_id !== cartItemId);
  } else {
    items = items.map((i) =>
      i.cart_item_id === cartItemId ? { ...i, quantity, updated_at: now() } : i,
    );
  }
  write(KEYS.cartItems, items);
  if (items.length === 0) write(KEYS.cart, null);
}

export const removeCartItem = (cartItemId: number) => updateCartItemQuantity(cartItemId, 0);

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
  paymentType: OrderPaymentType;
  requiredPayers: number;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  items: Array<{ menu_id: number; menu_name: string; menu_price: number; quantity: number }>;
}): Order {
  const orderId = Date.now();
  const order: Order = {
    order_id: orderId,
    session_id: getSessionId(),
    restaurant_id: input.restaurantId,
    payment_type: input.paymentType,
    status: "paid",
    required_payers: input.requiredPayers,
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
    session_id: getSessionId(),
    payment_method: input.paymentMethod,
    paid_amount: input.totalAmount,
    status: "paid",
    created_at: now(),
    updated_at: now(),
  };
  write(KEYS.payments, [...read<Payment[]>(KEYS.payments, []), payment]);

  clearCart();
  return order;
}
