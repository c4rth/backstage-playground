import { OwnershipType } from '@internal/plugin-api-platform-common';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

export function useStoredOwnership(
  storageKey: string,
): [OwnershipType, Dispatch<SetStateAction<OwnershipType>>] {
  return useState<OwnershipType>(() =>
    sessionStorage.getItem(storageKey) === 'owned' ? 'owned' : 'all',
  );
}

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

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, ...dependencies]);
}
