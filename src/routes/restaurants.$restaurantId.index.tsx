import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, BackLink } from "@/components/AppShell";
import { formatWon, menusQuery, restaurantImagesQuery, restaurantQuery } from "@/data/api";

export const Route = createFileRoute("/restaurants/$restaurantId/")({
  loader: async ({ context, params }) => {
    const id = Number(params.restaurantId);
    const restaurant = await context.queryClient.ensureQueryData(restaurantQuery(id));
    if (!restaurant) throw notFound();
    context.queryClient.ensureQueryData(menusQuery(id));
    context.queryClient.ensureQueryData(restaurantImagesQuery(id));
    return { name: restaurant.name, description: restaurant.description };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — 배달모아` : "식당 정보 — 배달모아";
    const description = loaderData?.description ?? "식당 메뉴와 정보를 확인하세요.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: RestaurantDetailPage,
});

function RestaurantDetailPage() {
  const { restaurantId } = Route.useParams();
  const id = Number(restaurantId);
  const { data: restaurant } = useSuspenseQuery(restaurantQuery(id));
  const { data: menus } = useSuspenseQuery(menusQuery(id));
  const { data: images } = useSuspenseQuery(restaurantImagesQuery(id));

  if (!restaurant) return null;

  return (
    <AppShell title={restaurant.name} backTo={<BackLink to="/" />}>
      <img
        src={images[0]?.image_url}
        alt={`${restaurant.name} 대표 이미지`}
        className="h-44 w-full object-cover"
      />

      <section className="space-y-2 border-b p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">{restaurant.name}</h2>
          <span
            className={`rounded px-1.5 py-0.5 text-[11px] ${
              restaurant.is_open
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {restaurant.is_open ? "영업중" : "준비중"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{restaurant.description}</p>
        <dl className="grid grid-cols-2 gap-2 pt-2 text-sm">
          <div className="rounded-lg bg-muted/60 p-3">
            <dt className="text-xs text-muted-foreground">최소주문금액</dt>
            <dd className="font-semibold">{formatWon(restaurant.minimum_order_amount)}</dd>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <dt className="text-xs text-muted-foreground">배달비</dt>
            <dd className="font-semibold">{formatWon(restaurant.delivery_fee)}</dd>
          </div>
        </dl>
      </section>

      <section className="p-4">
        <h3 className="mb-3 font-bold">메뉴</h3>
        <ul className="divide-y">
          {menus.map((m) => (
            <li key={m.menu_id}>
              <Link
                to="/restaurants/$restaurantId/menus/$menuId"
                params={{ restaurantId, menuId: String(m.menu_id) }}
                className="flex gap-3 py-3 transition-colors hover:bg-accent/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{m.name}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{m.description}</p>
                  <p className="mt-1 text-sm font-semibold">{formatWon(m.price)}</p>
                </div>
                <img
                  src={m.image_url}
                  alt={m.name}
                  loading="lazy"
                  className="size-20 shrink-0 rounded-lg object-cover"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
