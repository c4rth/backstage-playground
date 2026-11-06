import { useCallback } from 'react';
import { healthDashboardBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';

export function useGetHealthV1Data() {
  const api = useApi(healthDashboardBackendApiRef);

  return useCallback(
    async function getHealthData() {
      return api.getHealthV1Data();
    },
    [api],
  );
}

export function useGetHealthV2Data() {
  const api = useApi(healthDashboardBackendApiRef);

  return useCallback(
    async function getHealthData() {
      return api.getHealthV2Data();
    },
    [api],
  );
}
