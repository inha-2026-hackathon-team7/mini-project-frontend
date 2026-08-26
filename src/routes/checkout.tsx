import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiErrorState, AppShell, BackLink, LoadingState } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { formatWon } from "@/data/api";
import type { PaymentMethod } from "@/data/types";
import { CART_QUERY_KEY } from "@/lib/cart";
import { paymentMethodLabel } from "@/lib/labels";
import { checkoutQuery, createOrder, ORDERS_QUERY_KEY } from "@/lib/orders";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "결제하기 — 배달모아" },
      { name: "description", content: "결제 수단을 선택하고 주문을 완료하세요." },
      { property: "og:title", content: "결제하기 — 배달모아" },
      { property: "og:description", content: "결제 수단을 선택하고 주문을 완료하세요." },
    ],
  }),
  component: CheckoutPage,
});

const DEFAULT_METHODS: PaymentMethod[] = ["card", "transfer", "cash"];

const isPaymentMethod = (value: string): value is PaymentMethod =>
  (DEFAULT_METHODS as string[]).includes(value);

function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: checkout, isLoading, error } = useQuery(checkoutQuery());
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [pending, setPending] = useState(false);

  const items = checkout?.items ?? [];
  const subtotal = checkout?.subtotal ?? 0;
  const deliveryFee = checkout?.deliveryFee ?? 0;
  const total = checkout?.totalAmount ?? subtotal + deliveryFee;
  const canOrder = items.length > 0 && (checkout?.canOrder ?? false);

  const methods =
    checkout?.availablePaymentMethods?.filter(isPaymentMethod) ?? DEFAULT_METHODS;

  // 서버가 내려준 결제수단만 선택 가능하도록, 현재 선택이 목록에 없으면 첫 항목으로 맞춘다.
  useEffect(() => {
    const first = methods[0];
    if (first && !methods.includes(method)) {
      setMethod(first);
    }
  }, [methods, method]);

  if (isLoading) {
    return (
      <AppShell title="결제하기" backTo={<BackLink to="/cart" />}>
        <LoadingState />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="결제하기" backTo={<BackLink to="/cart" />}>
        <ApiErrorState message={(error as Error).message} />
      </AppShell>
    );
  }

  const handlePay = async () => {
    if (items.length === 0) return;
    setPending(true);
    try {
      const order = await createOrder({
        paymentType: "single",
        requiredPayers: 1,
        paymentMethod: method,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ["checkout"] }),
      ]);
      toast.success("결제가 완료되었어요");
      navigate({ to: "/orders/$orderId", params: { orderId: String(order.orderId) } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <AppShell
      title="결제하기"
      backTo={<BackLink to="/cart" />}
      footer={
        <Button
          className="h-12 w-full text-base"
          disabled={!canOrder || pending}
          onClick={handlePay}
        >
          {formatWon(total)} 결제하기
        </Button>
      }
    >
      {items.length === 0 ? (
        <p className="py-24 text-center text-sm text-muted-foreground">결제할 상품이 없어요.</p>
      ) : (
        <div className="space-y-6 p-4">
          <section>
            <h2 className="mb-2 font-bold">주문 내역</h2>
            <p className="mb-2 text-sm text-muted-foreground">{checkout?.restaurantName}</p>
            <ul className="space-y-1 text-sm">
              {items.map((item) => (
                <li key={item.cartItemId} className="flex justify-between">
                  <span>
                    {item.menuName} x {item.quantity}
                  </span>
                  <span>
                    {formatWon(item.itemTotalAmount ?? item.menuPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-bold">결제 수단</h2>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMethod(value)}
                  className={`rounded-lg border px-2 py-3 text-sm font-medium transition-colors ${
                    method === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {paymentMethodLabel(value)}
                </button>
              ))}
            </div>
          </section>

          <dl className="space-y-1.5 rounded-xl bg-muted/60 p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">주문금액</dt>
              <dd>{formatWon(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">배달비</dt>
              <dd>{formatWon(deliveryFee)}</dd>
            </div>
            <div className="flex justify-between border-t pt-1.5 font-bold">
              <dt>총 결제금액</dt>
              <dd>{formatWon(total)}</dd>
            </div>
          </dl>
        </div>
      )}
    </AppShell>
  );
}
