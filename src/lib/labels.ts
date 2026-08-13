import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/data/types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "결제 대기",
  paid: "주문 접수",
  cooking: "조리중",
  delivering: "배달중",
  completed: "배달 완료",
  cancelled: "주문 취소",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  card: "카드",
  transfer: "계좌이체",
  cash: "만나서 결제",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "결제 대기",
  paid: "결제 완료",
  failed: "결제 실패",
};
