import { useEffect, useRef, useState } from 'react';

export function useStoredValue<T extends string = string>(
  storageKey: string, 
  defaultValue: T = '' as T
): {
  initialValue: T;
  storeValue: (search: T | null | undefined) => void;
} {
  const [initialValue, storeNewValue] = useState<T>(
    () => (sessionStorage.getItem(storageKey) as T | null) ?? defaultValue,
  );

  return {
    initialValue,
    storeValue: search => {
      sessionStorage.setItem(storageKey, search ?? '');
      storeNewValue((search ?? defaultValue) as T);
    },
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
