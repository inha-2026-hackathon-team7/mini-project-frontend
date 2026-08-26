// 백엔드 API DTO 기준 타입 (Swagger v0.0.1). 금액은 정수, 원 단위.

export interface RestaurantListItem {
  restaurantId: number;
  name: string;
  description: string;
  minimumOrderAmount: number;
  deliveryFee: number;
  open: boolean;
  thumbnailUrl: string;
}

export interface RestaurantImage {
  imageId: number;
  imageUrl: string;
  type: string;
  sortOrder: number;
}

export interface RestaurantMenu {
  menuId: number;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
}

export interface RestaurantDetail {
  restaurantId: number;
  name: string;
  description: string;
  minimumOrderAmount: number;
  deliveryFee: number;
  open: boolean;
  images: RestaurantImage[];
  menus: RestaurantMenu[];
}

export interface MenuDetail {
  menuId: number;
  restaurantId: number;
  restaurantName: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
}

export interface CartItemResponse {
  cartItemId: number;
  menuId: number;
  menuName: string;
  menuPrice: number;
  imageUrl: string;
  quantity: number;
  itemTotalAmount: number;
}

export interface CartResponse {
  cartId: number | null;
  restaurantId: number | null;
  restaurantName: string | null;
  minimumOrderAmount: number;
  deliveryFee: number;
  subtotal: number;
  totalAmount: number;
  remainingAmount: number;
  canOrder: boolean;
  items: CartItemResponse[];
}

// ---- 주문/결제 (백엔드 /orders* API 기준) ----

export type OrderPaymentType = "single" | "split";
export type OrderStatus =
  | "pending"
  | "paid"
  | "cooking"
  | "delivering"
  | "completed"
  | "cancelled";
export type PaymentMethod = "card" | "transfer" | "cash";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface OrderListItem {
  orderId: number;
  restaurantId: number;
  restaurantName: string;
  status: string;
  totalAmount: number;
  orderedAt: string;
}

export interface OrderItemResponse {
  orderItemId: number;
  menuId: number;
  menuName: string;
  menuPrice: number;
  quantity: number;
  itemTotalAmount: number;
}

export interface PaymentResponse {
  paymentId: number;
  paymentMethod: string;
  paidAmount: number;
  status: string;
}

export interface OrderDetail {
  orderId: number;
  restaurantId: number;
  restaurantName: string;
  paymentType: string;
  status: string;
  requiredPayers: number;
  totalAmount: number;
  orderedAt: string;
  items: OrderItemResponse[];
  payment: PaymentResponse | null;
}

// POST /orders 응답은 주문 상세와 동일한 형태로 내려온다.
export type OrderCreateResponse = OrderDetail;

export interface OrderCreateRequest {
  paymentType: OrderPaymentType;
  requiredPayers: number;
  paymentMethod: PaymentMethod;
}

export interface CheckoutItemResponse {
  cartItemId: number;
  menuId: number;
  menuName: string;
  menuPrice: number;
  imageUrl: string;
  quantity: number;
  itemTotalAmount: number;
}

export interface CheckoutResponse {
  cartId: number | null;
  restaurantId: number | null;
  restaurantName: string | null;
  minimumOrderAmount: number;
  deliveryFee: number;
  subtotal: number;
  totalAmount: number;
  remainingAmount: number;
  canOrder: boolean;
  items: CheckoutItemResponse[];
  availablePaymentMethods: string[];
}
