import { createRouteRef } from '@backstage/core-plugin-api';

export const rootDocsRouteRef = createRouteRef({
  id: 'external-docs:reader-page',
  params: ['namespace', 'kind', 'name'],
});
