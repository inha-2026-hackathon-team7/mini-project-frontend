import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback } from "react";
import { AppShell, BackLink } from "@/components/AppShell";
import { formatWon } from "@/data/api";
import { useStoreValue } from "@/hooks/use-store";
import { getOrder, getOrderItems, getPaymentByOrder } from "@/lib/store";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/labels";

export const Route = createFileRoute("/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "주문 상세 — 배달모아" },
      { name: "description", content: "주문한 메뉴와 결제 정보를 자세히 확인하세요." },
      { property: "og:title", content: "주문 상세 — 배달모아" },
      { property: "og:description", content: "주문한 메뉴와 결제 정보를 확인하세요." },
    ],
  }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const id = Number(orderId);

  const order = useStoreValue(useCallback(() => getOrder(id), [id]), null);
  const items = useStoreValue(useCallback(() => getOrderItems(id), [id]), []);
  const payment = useStoreValue(useCallback(() => getPaymentByOrder(id), [id]), null);

  const itemsTotal = items.reduce((sum, i) => sum + i.menu_price * i.quantity, 0);

  return (
    <AppShell title="주문 상세" backTo={<BackLink to="/orders" />}>
      {!order ? (
        <div className="flex flex-col items-center gap-4 py-24">
          <p className="text-sm text-muted-foreground">주문 정보를 찾을 수 없어요.</p>
          <Link to="/orders" className="text-sm font-semibold text-primary">
            주문 내역으로
          </Link>
        </div>
      ) : (
        <div className="space-y-6 p-4">
          <section className="rounded-xl border p-4">
            <p className="text-xs font-semibold text-primary">
              {ORDER_STATUS_LABEL[order.status]}
            </p>
            <h2 className="mt-1 text-lg font-bold">{order.restaurant_name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              주문번호 {order.order_id} · {new Date(order.ordered_at).toLocaleString("ko-KR")}
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-bold">주문 메뉴</h3>
            <ul className="divide-y text-sm">
              {items.map((item) => (
                <li key={item.order_item_id} className="flex justify-between py-2">
                  <span>
                    {item.menu_name} x {item.quantity}
                  </span>
                  <span>{formatWon(item.menu_price * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-bold">결제 정보</h3>
            <dl className="space-y-1.5 rounded-xl bg-muted/60 p-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">결제 수단</dt>
                <dd>{payment ? PAYMENT_METHOD_LABEL[payment.payment_method] : "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">결제 상태</dt>
                <dd>{payment ? PAYMENT_STATUS_LABEL[payment.status] : "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">메뉴 금액</dt>
                <dd>{formatWon(itemsTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">배달비</dt>
                <dd>{formatWon(order.total_amount - itemsTotal)}</dd>
              </div>
              <div className="flex justify-between border-t pt-1.5 font-bold">
                <dt>총 결제금액</dt>
                <dd>{formatWon(order.total_amount)}</dd>
              </div>
            </dl>
          </section>

          <Link
            to="/"
            className="block rounded-lg border py-3 text-center text-sm font-semibold"
          >
            다시 주문하러 가기
          </Link>
        </div>
      )}
    </AppShell>
  );
}
