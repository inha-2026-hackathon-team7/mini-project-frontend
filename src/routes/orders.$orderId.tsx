import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ApiErrorState, AppShell, BackLink, LoadingState } from "@/components/AppShell";
import { formatWon } from "@/data/api";
import { orderStatusLabel, paymentMethodLabel, paymentStatusLabel } from "@/lib/labels";
import { orderQuery } from "@/lib/orders";

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
  const { data: order, isLoading, error } = useQuery(orderQuery(id));

  if (isLoading) {
    return (
      <AppShell title="주문 상세" backTo={<BackLink to="/orders" />}>
        <LoadingState />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="주문 상세" backTo={<BackLink to="/orders" />}>
        <ApiErrorState message={(error as Error).message} />
      </AppShell>
    );
  }

  if (!order) {
    return (
      <AppShell title="주문 상세" backTo={<BackLink to="/orders" />}>
        <div className="flex flex-col items-center gap-4 py-24">
          <p className="text-sm text-muted-foreground">주문 정보를 찾을 수 없어요.</p>
          <Link to="/orders" className="text-sm font-semibold text-primary">
            주문 내역으로
          </Link>
        </div>
      </AppShell>
    );
  }

  const items = order.items ?? [];
  const payment = order.payment;
  const itemsTotal = items.reduce(
    (sum, i) => sum + (i.itemTotalAmount ?? i.menuPrice * i.quantity),
    0,
  );

  return (
    <AppShell title="주문 상세" backTo={<BackLink to="/orders" />}>
      <div className="space-y-6 p-4">
        <section className="rounded-xl border p-4">
          <p className="text-xs font-semibold text-primary">{orderStatusLabel(order.status)}</p>
          <h2 className="mt-1 text-lg font-bold">{order.restaurantName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            주문번호 {order.orderId} · {new Date(order.orderedAt).toLocaleString("ko-KR")}
          </p>
        </section>

        <section>
          <h3 className="mb-2 font-bold">주문 메뉴</h3>
          <ul className="divide-y text-sm">
            {items.map((item) => (
              <li key={item.orderItemId} className="flex justify-between py-2">
                <span>
                  {item.menuName} x {item.quantity}
                </span>
                <span>{formatWon(item.itemTotalAmount ?? item.menuPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 font-bold">결제 정보</h3>
          <dl className="space-y-1.5 rounded-xl bg-muted/60 p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">결제 수단</dt>
              <dd>{payment ? paymentMethodLabel(payment.paymentMethod) : "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">결제 상태</dt>
              <dd>{payment ? paymentStatusLabel(payment.status) : "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">메뉴 금액</dt>
              <dd>{formatWon(itemsTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">배달비</dt>
              <dd>{formatWon(order.totalAmount - itemsTotal)}</dd>
            </div>
            <div className="flex justify-between border-t pt-1.5 font-bold">
              <dt>총 결제금액</dt>
              <dd>{formatWon(order.totalAmount)}</dd>
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
    </AppShell>
  );
}
