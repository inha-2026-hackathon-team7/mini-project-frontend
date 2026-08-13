// ERD 기반 타입 정의 (금액은 정수, 원 단위)

export type RestaurantImageType = "thumbnail" | "detail";
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

export interface Restaurant {
  restaurant_id: number;
  name: string;
  description: string;
  minimum_order_amount: number;
  delivery_fee: number;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantImage {
  image_id: number;
  restaurant_id: number;
  image_url: string;
  type: RestaurantImageType;
  sort_order: number;
  created_at: string;
}

export interface Menu {
  menu_id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  cart_id: number;
  session_id: string;
  restaurant_id: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  cart_item_id: number;
  cart_id: number;
  menu_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  order_id: number;
  session_id: string;
  restaurant_id: number;
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
  session_id: string;
  payment_method: PaymentMethod;
  paid_amount: number;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}
