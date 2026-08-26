import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ApiErrorState, AppShell, BackLink, LoadingState } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { formatWon, menuQuery } from "@/data/api";
import { addCartItem, CART_QUERY_KEY, fetchCart } from "@/lib/cart";

export const Route = createFileRoute("/restaurants/$restaurantId/menus/$menuId")({
  head: () => ({
    meta: [
      { title: "메뉴 상세 — 배달모아" },
      { name: "description", content: "메뉴 상세 정보를 확인하고 장바구니에 담아보세요." },
      { property: "og:title", content: "메뉴 상세 — 배달모아" },
      { property: "og:description", content: "메뉴 상세 정보를 확인하고 담아보세요." },
    ],
  }),
  component: MenuDetailPage,
});

function MenuDetailPage() {
  const { restaurantId, menuId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: menu, isLoading, error } = useQuery(menuQuery(Number(menuId)));
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);

  const back = <BackLink to="/restaurants/$restaurantId" params={{ restaurantId }} />;

  if (isLoading) {
    return (
      <AppShell title="메뉴" backTo={back}>
        <LoadingState />
      </AppShell>
    );
  }

  if (error || !menu) {
    return (
      <AppShell title="메뉴" backTo={back}>
        <ApiErrorState message={(error as Error | null)?.message} />
      </AppShell>
    );
  }

  const total = menu.price * quantity;

  const handleAdd = async () => {
    setPending(true);
    try {
      const cart = await fetchCart();
      let clearExisting = false;
      if (cart.restaurantId && cart.restaurantId !== menu.restaurantId) {
        const ok = window.confirm(
          "다른 식당의 메뉴가 장바구니에 있어요. 장바구니를 비우고 새로 담을까요?",
        );
        if (!ok) return;
        clearExisting = true;
      }
      await addCartItem({ menuId: menu.menuId, quantity, clearExisting });
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("메뉴가 추가되었어요");
      navigate({ to: "/restaurants/$restaurantId", params: { restaurantId } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <AppShell
      title={menu.name}
      backTo={back}
      footer={
        <Button className="h-12 w-full text-base" disabled={pending} onClick={handleAdd}>
          {formatWon(total)} 담기
        </Button>
      }
    >
      <img src={menu.imageUrl} alt={menu.name} className="h-48 w-full bg-muted object-cover" />

      <div className="space-y-4 p-4">
        <div>
          <p className="text-xs text-muted-foreground">{menu.restaurantName}</p>
          <h2 className="mt-1 text-lg font-bold">{menu.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{menu.description}</p>
          <p className="mt-2 text-lg font-bold">{formatWon(menu.price)}</p>
        </div>

        <div className="flex items-center justify-between rounded-xl border p-3">
          <span className="text-sm font-medium">수량</span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              aria-label="수량 줄이기"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-6 text-center font-semibold">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              aria-label="수량 늘리기"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
