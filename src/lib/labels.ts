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

// 백엔드가 내려주는 상태 문자열을 한글 라벨로 변환한다. 알 수 없는 값은 그대로 노출한다.
export const orderStatusLabel = (status: string) =>
  ORDER_STATUS_LABEL[status as OrderStatus] ?? status;

export const paymentMethodLabel = (method: string) =>
  PAYMENT_METHOD_LABEL[method as PaymentMethod] ?? method;

export const paymentStatusLabel = (status: string) =>
  PAYMENT_STATUS_LABEL[status as PaymentStatus] ?? status;
