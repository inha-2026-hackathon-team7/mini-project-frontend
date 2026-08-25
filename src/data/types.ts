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

// ---- 주문/결제: 아직 API가 없어 로컬(localStorage)에 저장한다 ----

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

export interface Order {
  order_id: number;
  restaurant_id: number;
  restaurant_name: string;
  payment_type: OrderPaymentType;
  status: OrderStatus;
  required_payers: number;
  total_amount: number;
  ordered_at: string;
  updated_at: string;
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  menu_id: number;
  menu_name: string;
  menu_price: number;
  quantity: number;
}

export interface Payment {
  payment_id: number;
  order_id: number;
  payment_method: PaymentMethod;
  paid_amount: number;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}
