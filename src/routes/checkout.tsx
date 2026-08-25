import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ApiErrorState, AppShell, BackLink, LoadingState } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { formatWon } from "@/data/api";
import type { PaymentMethod } from "@/data/types";
import { CART_QUERY_KEY, cartQuery, clearCart } from "@/lib/cart";
import { createOrder } from "@/lib/store";

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

const METHODS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "card", label: "카드" },
  { value: "transfer", label: "계좌이체" },
  { value: "cash", label: "만나서 결제" },
];

function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: cart, isLoading, error } = useQuery(cartQuery());
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [pending, setPending] = useState(false);

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const deliveryFee = cart?.deliveryFee ?? 0;
  const total = cart?.totalAmount ?? subtotal + deliveryFee;

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
    if (!cart?.restaurantId || items.length === 0) return;
    setPending(true);
    try {
      // 주문/결제 API가 아직 없어 로컬에 주문을 생성한다.
      const order = createOrder({
        restaurantId: cart.restaurantId,
        restaurantName: cart.restaurantName ?? "",
        paymentMethod: method,
        totalAmount: total,
        items: items.map((item) => ({
          menu_id: item.menuId,
          menu_name: item.menuName,
          menu_price: item.menuPrice,
          quantity: item.quantity,
        })),
      });
      await clearCart();
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("결제가 완료되었어요");
      navigate({ to: "/orders/$orderId", params: { orderId: String(order.order_id) } });
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
          disabled={items.length === 0 || pending}
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
            <p className="mb-2 text-sm text-muted-foreground">{cart?.restaurantName}</p>
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
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={`rounded-lg border px-2 py-3 text-sm font-medium transition-colors ${
                    method === m.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {m.label}
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
