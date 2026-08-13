import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, BackLink } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { formatWon } from "@/data/api";
import { menus, restaurants } from "@/data/mock";
import type { PaymentMethod } from "@/data/types";
import { useStoreValue } from "@/hooks/use-store";
import { createOrder, getCart, getCartItems } from "@/lib/store";

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
  const cart = useStoreValue(getCart, null);
  const items = useStoreValue(getCartItems, []);
  const [method, setMethod] = useState<PaymentMethod>("card");

  const restaurant = restaurants.find((r) => r.restaurant_id === cart?.restaurant_id);
  const lines = items.map((item) => ({
    item,
    menu: menus.find((m) => m.menu_id === item.menu_id)!,
  }));
  const subtotal = lines.reduce((sum, l) => sum + l.menu.price * l.item.quantity, 0);
  const deliveryFee = restaurant?.delivery_fee ?? 0;
  const total = subtotal + deliveryFee;

  const handlePay = () => {
    if (!cart || lines.length === 0) return;
    const order = createOrder({
      restaurantId: cart.restaurant_id,
      paymentType: "single",
      requiredPayers: 1,
      paymentMethod: method,
      totalAmount: total,
      items: lines.map(({ item, menu }) => ({
        menu_id: menu.menu_id,
        menu_name: menu.name,
        menu_price: menu.price,
        quantity: item.quantity,
      })),
    });
    toast.success("결제가 완료되었어요");
    navigate({ to: "/orders/$orderId", params: { orderId: String(order.order_id) } });
  };

  return (
    <AppShell
      title="결제하기"
      backTo={<BackLink to="/cart" />}
      footer={
        <Button className="h-12 w-full text-base" disabled={lines.length === 0} onClick={handlePay}>
          {formatWon(total)} 결제하기
        </Button>
      }
    >
      {lines.length === 0 ? (
        <p className="py-24 text-center text-sm text-muted-foreground">
          결제할 상품이 없어요.
        </p>
      ) : (
        <div className="space-y-6 p-4">
          <section>
            <h2 className="mb-2 font-bold">주문 내역</h2>
            <p className="mb-2 text-sm text-muted-foreground">{restaurant?.name}</p>
            <ul className="space-y-1 text-sm">
              {lines.map(({ item, menu }) => (
                <li key={item.cart_item_id} className="flex justify-between">
                  <span>
                    {menu.name} x {item.quantity}
                  </span>
                  <span>{formatWon(menu.price * item.quantity)}</span>
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
