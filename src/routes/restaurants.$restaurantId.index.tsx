import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ApiErrorState, AppShell, BackLink, LoadingState } from "@/components/AppShell";
import { formatWon, restaurantQuery } from "@/data/api";

export const Route = createFileRoute("/restaurants/$restaurantId/")({
  head: () => ({
    meta: [
      { title: "식당 정보 — 배달모아" },
      { name: "description", content: "식당 메뉴와 배달 정보를 확인하고 주문하세요." },
      { property: "og:title", content: "식당 정보 — 배달모아" },
      { property: "og:description", content: "식당 메뉴와 배달 정보를 확인하세요." },
    ],
  }),
  component: RestaurantDetailPage,
});

function RestaurantDetailPage() {
  const { restaurantId } = Route.useParams();
  const id = Number(restaurantId);
  const { data: restaurant, isLoading, error } = useQuery(restaurantQuery(id));

  if (isLoading) {
    return (
      <AppShell title="식당 정보" backTo={<BackLink to="/" />}>
        <LoadingState />
      </AppShell>
    );
  }

  if (error || !restaurant) {
    return (
      <AppShell title="식당 정보" backTo={<BackLink to="/" />}>
        <ApiErrorState message={(error as Error | null)?.message} />
      </AppShell>
    );
  }

  const images = [...(restaurant.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const menus = restaurant.menus ?? [];

  return (
    <AppShell title={restaurant.name} backTo={<BackLink to="/" />}>
      {images[0] && (
        <img
          src={images[0].imageUrl}
          alt={`${restaurant.name} 대표 이미지`}
          className="h-44 w-full bg-muted object-cover"
        />
      )}

      <section className="space-y-2 border-b p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">{restaurant.name}</h2>
          <span
            className={`rounded px-1.5 py-0.5 text-[11px] ${
              restaurant.open ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {restaurant.open ? "영업중" : "준비중"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{restaurant.description}</p>
        <dl className="grid grid-cols-2 gap-2 pt-2 text-sm">
          <div className="rounded-lg bg-muted/60 p-3">
            <dt className="text-xs text-muted-foreground">최소주문금액</dt>
            <dd className="font-semibold">{formatWon(restaurant.minimumOrderAmount)}</dd>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <dt className="text-xs text-muted-foreground">배달비</dt>
            <dd className="font-semibold">{formatWon(restaurant.deliveryFee)}</dd>
          </div>
        </dl>
      </section>

      <section className="p-4">
        <h3 className="mb-3 font-bold">메뉴</h3>
        <ul className="divide-y">
          {menus.map((m) => (
            <li key={m.menuId}>
              <Link
                to="/restaurants/$restaurantId/menus/$menuId"
                params={{ restaurantId, menuId: String(m.menuId) }}
                className="flex gap-3 py-3 transition-colors hover:bg-accent/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{m.name}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{m.description}</p>
                  <p className="mt-1 text-sm font-semibold">{formatWon(m.price)}</p>
                </div>
                <img
                  src={m.imageUrl}
                  alt={m.name}
                  loading="lazy"
                  className="size-20 shrink-0 rounded-lg bg-muted object-cover"
                />
              </Link>
            </li>
          ))}
          {menus.length === 0 && (
            <li className="py-12 text-center text-sm text-muted-foreground">
              등록된 메뉴가 없어요.
            </li>
          )}
        </ul>
      </section>
    </AppShell>
  );
}
