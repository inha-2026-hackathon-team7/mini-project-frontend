import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ApiErrorState, AppShell, BackLink, LoadingState } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { formatWon } from "@/data/api";
import {
  CART_QUERY_KEY,
  cartQuery,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "장바구니 — 배달모아" },
      { name: "description", content: "담은 메뉴를 확인하고 수량을 조정한 뒤 주문하세요." },
      { property: "og:title", content: "장바구니 — 배달모아" },
      { property: "og:description", content: "담은 메뉴를 확인하고 바로 주문하세요." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: cart, isLoading, error } = useQuery(cartQuery());

  const items = cart?.items ?? [];
  const refresh = () => queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const backTo = cart?.restaurantId ? (
    <BackLink
      to="/restaurants/$restaurantId"
      params={{ restaurantId: String(cart.restaurantId) }}
    />
  ) : (
    <BackLink to="/" />
  );

  if (isLoading) {
    return (
      <AppShell title="장바구니" backTo={backTo}>
        <LoadingState />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="장바구니" backTo={backTo}>
        <ApiErrorState message={(error as Error).message} />
      </AppShell>
    );
  }

  const subtotal = cart?.subtotal ?? 0;
  const deliveryFee = cart?.deliveryFee ?? 0;
  const totalAmount = cart?.totalAmount ?? subtotal + deliveryFee;
  const remaining = cart?.remainingAmount ?? 0;
  const canOrder = items.length > 0 && (cart?.canOrder ?? false);

  return (
    <AppShell
      title="장바구니"
      backTo={backTo}
      footer={
        items.length > 0 ? (
          <div className="space-y-2">
            {!canOrder && remaining > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                최소 주문금액까지 {formatWon(remaining)} 남았어요
              </p>
            )}
            <Button
              className="h-12 w-full text-base"
              disabled={!canOrder}
              onClick={() => navigate({ to: "/checkout" })}
            >
              {formatWon(totalAmount)} 주문하기
            </Button>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24">
          <p className="text-sm text-muted-foreground">장바구니가 비어 있어요.</p>
          <Link to="/" className="text-sm font-semibold text-primary">
            식당 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <p className="text-sm font-semibold">{cart?.restaurantName}</p>
          <ul className="divide-y">
            {items.map((item) => (
              <li key={item.cartItemId} className="flex gap-3 py-3">
                <img
                  src={item.imageUrl}
                  alt={item.menuName}
                  loading="lazy"
                  className="size-16 rounded-lg bg-muted object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{item.menuName}</p>
                    <button
                      type="button"
                      aria-label="삭제"
                      onClick={() => runAction(() => removeCartItem(item.cartItemId))}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm font-semibold">
                    {formatWon(item.itemTotalAmount ?? item.menuPrice * item.quantity)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      aria-label="수량 줄이기"
                      onClick={() =>
                        runAction(() =>
                          item.quantity <= 1
                            ? removeCartItem(item.cartItemId)
                            : updateCartItemQuantity(item.cartItemId, item.quantity - 1),
                        )
                      }
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      aria-label="수량 늘리기"
                      onClick={() =>
                        runAction(() =>
                          updateCartItemQuantity(item.cartItemId, item.quantity + 1),
                        )
                      }
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

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
              <dt>합계</dt>
              <dd>{formatWon(totalAmount)}</dd>
            </div>
          </dl>
        </div>
      )}
    </AppShell>
  );
}
