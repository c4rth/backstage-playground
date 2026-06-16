import { useCallback } from 'react';
import { healthDashboardBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';

export function useGetHealthData() {
  const api = useApi(healthDashboardBackendApiRef);

  return useCallback(
    async function getHealthData() {
      return api.getHealthData();
    },
    [api],
  );
}
