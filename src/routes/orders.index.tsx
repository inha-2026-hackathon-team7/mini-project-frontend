import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, BackLink } from "@/components/AppShell";
import { formatWon } from "@/data/api";
import { restaurants } from "@/data/mock";
import { useStoreValue } from "@/hooks/use-store";
import { getOrders } from "@/lib/store";
import { ORDER_STATUS_LABEL } from "@/lib/labels";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "주문 내역 — 배달모아" },
      { name: "description", content: "지금까지 주문한 내역과 결제 상태를 확인하세요." },
      { property: "og:title", content: "주문 내역 — 배달모아" },
      { property: "og:description", content: "지금까지 주문한 내역을 확인하세요." },
    ],
  }),
  component: OrderListPage,
});

function OrderListPage() {
  const orders = useStoreValue(getOrders, []);

  return (
    <AppShell title="주문 내역" backTo={<BackLink to="/" />}>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24">
          <p className="text-sm text-muted-foreground">아직 주문 내역이 없어요.</p>
          <Link to="/" className="text-sm font-semibold text-primary">
            주문하러 가기
          </Link>
        </div>
      ) : (
        <ul className="space-y-3 p-4">
          {orders.map((order) => {
            const restaurant = restaurants.find(
              (r) => r.restaurant_id === order.restaurant_id,
            );
            return (
              <li key={order.order_id}>
                <Link
                  to="/orders/$orderId"
                  params={{ orderId: String(order.order_id) }}
                  className="block rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.ordered_at).toLocaleString("ko-KR")}
                    </span>
                  </div>
                  <p className="mt-1 font-semibold">{restaurant?.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatWon(order.total_amount)}
                    {order.payment_type === "split" && ` · ${order.required_payers}인 분할`}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
