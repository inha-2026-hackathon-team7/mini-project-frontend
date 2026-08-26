import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ApiErrorState, AppShell, BackLink, LoadingState } from "@/components/AppShell";
import { formatWon } from "@/data/api";
import { orderStatusLabel } from "@/lib/labels";
import { ordersQuery } from "@/lib/orders";

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
  const { data, isLoading, error } = useQuery(ordersQuery());
  const orders = data ?? [];

  if (isLoading) {
    return (
      <AppShell title="주문 내역" backTo={<BackLink to="/" />}>
        <LoadingState />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="주문 내역" backTo={<BackLink to="/" />}>
        <ApiErrorState message={(error as Error).message} />
      </AppShell>
    );
  }

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
          {orders.map((order) => (
            <li key={order.orderId}>
              <Link
                to="/orders/$orderId"
                params={{ orderId: String(order.orderId) }}
                className="block rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">
                    {orderStatusLabel(order.status)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.orderedAt).toLocaleString("ko-KR")}
                  </span>
                </div>
                <p className="mt-1 font-semibold">{order.restaurantName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatWon(order.totalAmount)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
