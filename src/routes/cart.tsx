import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { AppShell, BackLink } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { formatWon } from "@/data/api";
import { menus, restaurants } from "@/data/mock";
import { useStoreValue } from "@/hooks/use-store";
import { getCart, getCartItems, removeCartItem, updateCartItemQuantity } from "@/lib/store";

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
  const cart = useStoreValue(getCart, null);
  const items = useStoreValue(getCartItems, []);

  const restaurant = restaurants.find((r) => r.restaurant_id === cart?.restaurant_id);
  const lines = items.map((item) => ({
    item,
    menu: menus.find((m) => m.menu_id === item.menu_id)!,
  }));
  const subtotal = lines.reduce((sum, l) => sum + l.menu.price * l.item.quantity, 0);
  const deliveryFee = restaurant?.delivery_fee ?? 0;
  const minimum = restaurant?.minimum_order_amount ?? 0;
  const canOrder = lines.length > 0 && subtotal >= minimum;

  return (
    <AppShell
      title="장바구니"
      backTo={<BackLink to="/" />}
      footer={
        lines.length > 0 ? (
          <div className="space-y-2">
            {!canOrder && (
              <p className="text-center text-xs text-muted-foreground">
                최소 주문금액까지 {formatWon(minimum - subtotal)} 남았어요
              </p>
            )}
            <Button
              className="h-12 w-full text-base"
              disabled={!canOrder}
              onClick={() => navigate({ to: "/checkout" })}
            >
              {formatWon(subtotal + deliveryFee)} 주문하기
            </Button>
          </div>
        ) : undefined
      }
    >
      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24">
          <p className="text-sm text-muted-foreground">장바구니가 비어 있어요.</p>
          <Link to="/" className="text-sm font-semibold text-primary">
            식당 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <p className="text-sm font-semibold">{restaurant?.name}</p>
          <ul className="divide-y">
            {lines.map(({ item, menu }) => (
              <li key={item.cart_item_id} className="flex gap-3 py-3">
                <img
                  src={menu.image_url}
                  alt={menu.name}
                  loading="lazy"
                  className="size-16 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{menu.name}</p>
                    <button
                      type="button"
                      aria-label="삭제"
                      onClick={() => removeCartItem(item.cart_item_id)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm font-semibold">
                    {formatWon(menu.price * item.quantity)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      aria-label="수량 줄이기"
                      onClick={() =>
                        updateCartItemQuantity(item.cart_item_id, item.quantity - 1)
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
                        updateCartItemQuantity(item.cart_item_id, item.quantity + 1)
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
              <dd>{formatWon(subtotal + deliveryFee)}</dd>
            </div>
          </dl>
        </div>
      )}
    </AppShell>
  );
}
