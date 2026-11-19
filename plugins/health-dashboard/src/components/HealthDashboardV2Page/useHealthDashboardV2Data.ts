import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { useCallback, useEffect, useState } from 'react';
import { useGetHealthV2Data } from '../../hooks';
import { healthDashboardTranslationRef } from '../../translation';
import { HealthDataError, HealthV2Data } from '../../types';

export function useHealthDashboardV2Data() {
  const { t } = useTranslationRef(healthDashboardTranslationRef);
  const getHealthData = useGetHealthV2Data();
  const [healthData, setHealthData] = useState<HealthV2Data>({});
  const [healthDataErrors, setHealthDataErrors] = useState<HealthDataError[]>(
    [],
  );
  const [loadError, setLoadError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  const reload = useCallback(() => setReloadCount(count => count + 1), []);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setLoadError(undefined);
    getHealthData()
      .then(response => {
        if (isMounted) {
          setHealthData(response.healthData);
          setHealthDataErrors(response.errors);
        }
      })
      .catch(error => {
        if (isMounted) {
          setLoadError(
            error instanceof Error
              ? error
              : new Error(t('dashboardV2Page.errors.unknown')),
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [getHealthData, reloadCount, t]);

  return { healthData, healthDataErrors, loadError, isLoading, reload };
}
