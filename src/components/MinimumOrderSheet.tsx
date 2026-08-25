import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { formatWon } from "@/data/api";
import type { RestaurantDetail } from "@/data/types";
import { addCartItem, CART_QUERY_KEY, cartQuery } from "@/lib/cart";

const SUGGESTION_LIMIT = 3;

export function MinimumOrderSheet({ restaurant }: { restaurant: RestaurantDetail }) {
  const queryClient = useQueryClient();
  const { data: cart } = useQuery(cartQuery());
  const [dismissed, setDismissed] = useState(false);
  const [pendingMenuId, setPendingMenuId] = useState<number | null>(null);

  const isSameRestaurant =
    !!cart && (cart.items?.length ?? 0) > 0 && cart.restaurantId === restaurant.restaurantId;
  const subtotal = cart?.subtotal ?? 0;
  const remaining = Math.max(0, restaurant.minimumOrderAmount - subtotal);
  const isBelowMinimum = isSameRestaurant && remaining > 0;

  // 남은 금액을 가장 효율적으로 채우는 메뉴(가격 내림차순)를 우선 추천하고,
  // 3개가 안 되면 남은 금액보다 비싼 메뉴 중 싼 순으로 채워 항상 3개를 보여준다.
  const { suggestions, allTooExpensive } = useMemo(() => {
    if (!isBelowMinimum) return { suggestions: [], allTooExpensive: false };
    const available = (restaurant.menus ?? []).filter((m) => m.available && m.price > 0);
    const affordable = available
      .filter((m) => m.price <= remaining)
      .sort((a, b) => b.price - a.price);
    const tooExpensive = available
      .filter((m) => m.price > remaining)
      .sort((a, b) => a.price - b.price);
    return {
      suggestions: [...affordable, ...tooExpensive].slice(0, SUGGESTION_LIMIT),
      allTooExpensive: affordable.length === 0,
    };
  }, [restaurant.menus, remaining, isBelowMinimum]);

  // 미달 상태가 다시 발생하면(예: 다른 메뉴를 담아 미달이 되면) 시트를 다시 연다.
  useEffect(() => {
    if (!isBelowMinimum) setDismissed(false);
  }, [isBelowMinimum]);

  const open = isBelowMinimum && !dismissed;

  const handleAdd = async (menuId: number) => {
    setPendingMenuId(menuId);
    try {
      await addCartItem({ menuId, quantity: 1 });
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("장바구니에 담았어요");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPendingMenuId(null);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(next) => !next && setDismissed(true)}>
      <DrawerContent className="mx-auto max-w-md">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-base">
            주문까지 <span className="text-primary">{formatWon(remaining)}</span> 미달!
          </DrawerTitle>
          <DrawerDescription>
            {allTooExpensive ? "이런 메뉴는 어떠세요? (더 담아야 해요)" : "이런 메뉴는 어떠세요?"}
          </DrawerDescription>
        </DrawerHeader>

        {suggestions.length > 0 ? (
          <ul className="flex gap-3 overflow-x-auto px-4 pb-6">
            {suggestions.map((m) => (
              <li
                key={m.menuId}
                className="flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border"
              >
                <img
                  src={m.imageUrl}
                  alt={m.name}
                  loading="lazy"
                  className="h-24 w-full bg-muted object-cover"
                />
                <div className="flex flex-1 flex-col gap-1 p-2">
                  <p className="line-clamp-2 text-sm font-medium">{m.name}</p>
                  <p className="mt-auto text-sm font-semibold">{formatWon(m.price)}</p>
                  <button
                    type="button"
                    disabled={pendingMenuId === m.menuId}
                    onClick={() => handleAdd(m.menuId)}
                    className="mt-1 flex items-center justify-center gap-1 rounded-lg bg-primary py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <Plus className="size-3.5" />
                    담기
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 pb-6 text-sm text-muted-foreground">추천할 메뉴가 없어요.</p>
        )}
      </DrawerContent>
    </Drawer>
  );
}
