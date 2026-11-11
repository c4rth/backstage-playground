import {
  createTranslationRef,
  TranslationApi,
  TranslationFunction,
} from '@backstage/frontend-plugin-api';

export const appRegistryMetadata = {
  title: 'App Registry',
  mockDescription: 'Enable the mock app registry endpoint for testing purposes',
} as const;

export const appRegistryTranslationRef = createTranslationRef({
  id: 'plugin.app-registry',
  messages: {
    page: {
      title: 'Operations',
      apiError: 'Failed to call AppRegistry',
      empty: 'No operations found.',
      columns: {
        method: 'Method',
        name: 'Name',
        abac: 'ABAC',
        bFunction: 'B-Function',
      },
    },
    abac: {
      none: 'No ABAC',
      mapping: 'PDP Mapping',
      noMapping: 'No PDP mapping',
      valuePath: 'Value Path',
      pdpField: 'PDP Field',
    },
    api: {
      requiredParameters:
        'All parameters (system, appName, appVersion, environment) are required',
      fetchError:
        'HTTP {{status}}: Failed to fetch AppRegistry operations - {{detail}}',
      invalidResponse: 'Invalid response format: expected array of endpoints',
      operationError:
        'Failed to get operations for app {{system}}/{{appName}}@{{appVersion}} in {{environment}}: {{detail}}',
      unknownError: 'Unknown error',
    },
  },
});

export type AppRegistryTranslator = TranslationFunction<
  typeof appRegistryTranslationRef.T
>;

export async function getAppRegistryTranslator(
  translationApi: TranslationApi,
): Promise<AppRegistryTranslator> {
  const snapshot = translationApi.getTranslation(appRegistryTranslationRef);
  if (snapshot.ready) {
    return snapshot.t;
  }

  let subscription: { unsubscribe(): void } | undefined;
  try {
    return await new Promise<AppRegistryTranslator>((resolve, reject) => {
      subscription = translationApi
        .translation$(appRegistryTranslationRef)
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
                'App Registry translation stream completed before messages were ready',
              ),
            ),
        });
    });
  } finally {
    subscription?.unsubscribe();
  }
}
