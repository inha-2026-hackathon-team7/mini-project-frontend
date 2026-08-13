import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { formatWon, restaurantImagesQuery, restaurantsQuery } from "@/data/api";
import { restaurantImages } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "배달모아 — 근처 맛집 배달 주문" },
      {
        name: "description",
        content: "근처 인기 식당을 둘러보고 메뉴를 담아 바로 배달 주문하세요.",
      },
      { property: "og:title", content: "배달모아 — 근처 맛집 배달 주문" },
      {
        property: "og:description",
        content: "근처 인기 식당을 둘러보고 메뉴를 담아 바로 배달 주문하세요.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(restaurantsQuery());
  },
  component: RestaurantListPage,
});

function thumbnailFor(restaurantId: number) {
  return (
    restaurantImages.find((i) => i.restaurant_id === restaurantId && i.type === "thumbnail")
      ?.image_url ?? ""
  );
}

function RestaurantListPage() {
  const { data: restaurants } = useSuspenseQuery(restaurantsQuery());
  const [keyword, setKeyword] = useState("");
  const [openOnly, setOpenOnly] = useState(false);

  const filtered = useMemo(
    () =>
      restaurants.filter(
        (r) =>
          (!openOnly || r.is_open) &&
          (r.name.includes(keyword) || r.description.includes(keyword)),
      ),
    [restaurants, keyword, openOnly],
  );

  return (
    <AppShell title="배달모아">
      <div className="space-y-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="식당이나 메뉴를 검색해 보세요"
            className="pl-9"
          />
        </div>

        <button
          type="button"
          onClick={() => setOpenOnly((v) => !v)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            openOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground"
          }`}
        >
          영업중만 보기
        </button>

        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r.restaurant_id}>
              <Link
                to="/restaurants/$restaurantId"
                params={{ restaurantId: String(r.restaurant_id) }}
                className="flex gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-accent/40"
              >
                <img
                  src={thumbnailFor(r.restaurant_id)}
                  alt={`${r.name} 대표 이미지`}
                  loading="lazy"
                  className="size-20 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-semibold">{r.name}</h2>
                    {!r.is_open && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        준비중
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                    {r.description}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    최소주문 {formatWon(r.minimum_order_amount)} · 배달비{" "}
                    {formatWon(r.delivery_fee)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="py-16 text-center text-sm text-muted-foreground">
              조건에 맞는 식당이 없어요.
            </li>
          )}
        </ul>
      </div>
    </AppShell>
  );
}

void restaurantImagesQuery;
