import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ApiErrorState, AppShell, LoadingState } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { formatWon, restaurantsQuery } from "@/data/api";

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
  component: RestaurantListPage,
});

function RestaurantListPage() {
  const { data, isLoading, error } = useQuery(restaurantsQuery());
  const [keyword, setKeyword] = useState("");
  const [openOnly, setOpenOnly] = useState(false);

  const restaurants = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(
    () =>
      restaurants.filter(
        (r) =>
          (!openOnly || r.open) &&
          ((r.name ?? "").includes(keyword) || (r.description ?? "").includes(keyword)),
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

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ApiErrorState message={(error as Error).message} />
        ) : (
          <ul className="space-y-3">
            {filtered.map((r) => (
              <li key={r.restaurantId}>
                <Link
                  to="/restaurants/$restaurantId"
                  params={{ restaurantId: String(r.restaurantId) }}
                  className="flex gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-accent/40"
                >
                  <img
                    src={r.thumbnailUrl}
                    alt={`${r.name} 대표 이미지`}
                    loading="lazy"
                    className="size-20 shrink-0 rounded-lg bg-muted object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate font-semibold">{r.name}</h2>
                      {!r.open && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          준비중
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                      {r.description}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      최소주문 {formatWon(r.minimumOrderAmount)} · 배달비{" "}
                      {formatWon(r.deliveryFee)}
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
        )}
      </div>
    </AppShell>
  );
}
