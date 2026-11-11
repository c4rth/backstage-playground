export function createHeaders(): Headers {
  return new Headers({ Accept: 'application/json' });
}

export function toErrorMessage(
  error: unknown,
  t: HealthDashboardTranslator,
): string {
  return error instanceof Error ? error.message : t('api.errors.unknown');
}

export async function getHealthDashboardTranslator(
  translationApi: TranslationApi,
): Promise<HealthDashboardTranslator> {
  const snapshot = translationApi.getTranslation(healthDashboardTranslationRef);
  if (snapshot.ready) {
    return snapshot.t;
  }

  let subscription: { unsubscribe(): void } | undefined;
  try {
    return await new Promise<HealthDashboardTranslator>((resolve, reject) => {
      subscription = translationApi
        .translation$(healthDashboardTranslationRef)
        .subscribe({
          next: value => {
            if (value.ready) {
              resolve(value.t);
            }
          },
          error: reject,
          complete: () =>
            reject(
              new Error(
                'Health Dashboard translation stream completed before messages were ready',
              ),
            ),
        });
    });
  } finally {
    subscription?.unsubscribe();
  }
}
import { TranslationApi } from '@backstage/frontend-plugin-api';
import {
  healthDashboardTranslationRef,
  HealthDashboardTranslator,
} from '../translation';
