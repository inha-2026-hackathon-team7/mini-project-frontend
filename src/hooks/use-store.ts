import { useCallback, useEffect, useState } from "react";
import { subscribeStore } from "@/lib/store";

/** localStorage 기반 저장소를 구독해 클라이언트에서만 값을 읽는다. */
export function useStoreValue<T>(read: () => T, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);
  const sync = useCallback(() => setValue(read()), [read]);

  useEffect(() => {
    sync();
    return subscribeStore(sync);
  }, [sync]);

  return value;
}
