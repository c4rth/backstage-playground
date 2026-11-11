import { TranslationApi } from '@backstage/frontend-plugin-api';
import {
  apiPlatformTranslationRef,
  ApiPlatformTranslator,
} from '../translation';

export async function getApiPlatformTranslator(
  translationApi: TranslationApi,
): Promise<ApiPlatformTranslator> {
  const snapshot = translationApi.getTranslation(apiPlatformTranslationRef);
  if (snapshot.ready) {
    return snapshot.t;
  }

  let subscription: { unsubscribe(): void } | undefined;
  try {
    return await new Promise<ApiPlatformTranslator>((resolve, reject) => {
      subscription = translationApi
        .translation$(apiPlatformTranslationRef)
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
                'API Platform translation stream completed before messages were ready',
              ),
            ),
        });
    });
  } finally {
    subscription?.unsubscribe();
  }
}
