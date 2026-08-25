import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ReceiptText, ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";
import { cartQuery } from "@/lib/cart";

interface AppShellProps {
  title: string;
  backTo?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function AppShell({ title, backTo, children, footer }: AppShellProps) {
  const { data: cart } = useQuery(cartQuery());
  const count = (cart?.items ?? []).reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-sm">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b bg-background/95 px-4 py-3 backdrop-blur">
          {backTo}
          <h1 className="flex-1 truncate text-base font-bold">{title}</h1>
          <Link
            to="/orders"
            aria-label="주문 내역"
            className="rounded-md p-2 text-foreground transition-colors hover:bg-accent"
          >
            <ReceiptText className="size-5" />
          </Link>
          <Link
            to="/cart"
            aria-label="장바구니"
            className="relative rounded-md p-2 text-foreground transition-colors hover:bg-accent"
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </header>

        <main className="flex-1 pb-6">{children}</main>

        {footer && (
          <div className="sticky bottom-0 border-t bg-background/95 p-4 backdrop-blur">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function BackLink({ to, params }: { to: string; params?: Record<string, string> }) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      params={params as never}
      aria-label="뒤로"
      className="-ml-2 rounded-md p-2 transition-colors hover:bg-accent"
    >
      <ChevronLeft className="size-5" />
    </Link>
  );
}

/** API 호출 실패 시 공통 안내 */
export function ApiErrorState({ message }: { message?: string | undefined }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-24 text-center">
      <p className="text-sm font-semibold">불러오지 못했어요</p>
      <p className="text-sm text-muted-foreground">
        {message ?? "서버에 연결할 수 없습니다. API 서버가 실행 중인지 확인해 주세요."}
      </p>
    </div>
  );
}

export function LoadingState() {
  return <p className="py-24 text-center text-sm text-muted-foreground">불러오는 중…</p>;
}
