import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, BackLink } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatWon, menuQuery, restaurantQuery } from "@/data/api";
import { addToCart, getCart } from "@/lib/store";

export const Route = createFileRoute("/restaurants/$restaurantId/menus/$menuId")({
  loader: async ({ context, params }) => {
    const menu = await context.queryClient.ensureQueryData(menuQuery(Number(params.menuId)));
    if (!menu) throw notFound();
    context.queryClient.ensureQueryData(restaurantQuery(Number(params.restaurantId)));
    return { name: menu.name, description: menu.description };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — 배달모아` : "메뉴 상세 — 배달모아";
    const description = loaderData?.description ?? "메뉴 상세 정보를 확인하고 담아보세요.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: MenuDetailPage,
});

function MenuDetailPage() {
  const { restaurantId, menuId } = Route.useParams();
  const navigate = useNavigate();
  const { data: menu } = useSuspenseQuery(menuQuery(Number(menuId)));
  const { data: restaurant } = useSuspenseQuery(restaurantQuery(Number(restaurantId)));
  const [quantity, setQuantity] = useState(1);
  const [request, setRequest] = useState("");

  if (!menu) return null;

  const total = menu.price * quantity;

  const handleAdd = () => {
    const cart = getCart();
    if (cart && cart.restaurant_id !== menu.restaurant_id) {
      const ok = window.confirm(
        "다른 식당의 메뉴가 장바구니에 있어요. 장바구니를 비우고 새로 담을까요?",
      );
      if (!ok) return;
    }
    addToCart(menu.restaurant_id, menu.menu_id, quantity);
    toast.success("장바구니에 담았어요");
    navigate({ to: "/cart" });
  };

  return (
    <AppShell
      title={menu.name}
      backTo={<BackLink to="/restaurants/$restaurantId" params={{ restaurantId }} />}
      footer={
        <Button className="h-12 w-full text-base" onClick={handleAdd}>
          {formatWon(total)} 담기
        </Button>
      }
    >
      <img src={menu.image_url} alt={menu.name} className="h-48 w-full object-cover" />

      <div className="space-y-4 p-4">
        <div>
          <p className="text-xs text-muted-foreground">{restaurant?.name}</p>
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

        <div className="space-y-2">
          <label htmlFor="request" className="text-sm font-medium">
            요청사항
          </label>
          <Textarea
            id="request"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="예) 덜 맵게 해주세요"
          />
        </div>
      </div>
    </AppShell>
  );
}
