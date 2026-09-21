import { useEffect, useRef, useState } from 'react';

export function useStoredSearch(storageKey: string): {
  initialSearch: string;
  storeSearch: (search: string | null | undefined) => void;
} {
  const [initialSearch] = useState(
    () => sessionStorage.getItem(storageKey) ?? '',
  );

  return {
    initialSearch,
    storeSearch: search => sessionStorage.setItem(storageKey, search ?? ''),
  };
}

export function useReloadOnChange(
  reload: () => unknown,
  dependencies: readonly unknown[],
): void {
  const isInitialRender = useRef(true);
  const reloadRef = useRef(reload);
  reloadRef.current = reload;

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    reloadRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
