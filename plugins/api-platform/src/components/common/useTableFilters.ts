import { OwnershipType } from '@internal/plugin-api-platform-common';
import { Dispatch, SetStateAction, useState } from 'react';

export function useStoredOwnership(
  storageKey: string,
): [OwnershipType, Dispatch<SetStateAction<OwnershipType>>] {
  return useState<OwnershipType>(() =>
    sessionStorage.getItem(storageKey) === 'owned' ? 'owned' : 'all',
  );
}
