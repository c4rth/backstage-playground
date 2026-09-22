import { useEffect, useRef, useState } from 'react';

export function useStoredValue(storageKey: string, defaultValue = ''): {
  initialValue: string;
  storeValue: (search: string | null | undefined) => void;
} {
  const [initialValue] = useState(
    () => sessionStorage.getItem(storageKey) ?? defaultValue,
  );

  return {
    initialValue,
    storeValue: search => sessionStorage.setItem(storageKey, search ?? ''),
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
