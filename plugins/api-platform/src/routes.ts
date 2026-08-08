import { createRouteRef } from '@backstage/core-plugin-api';

export const apiPlatformRouteRef = createRouteRef({
  id: 'api-platform',
});

export const apiPlatformApiDefinitionRouteRef = createRouteRef({
  id: 'api-platform-api-definition',
  params: [ 'system', 'name' ],
});

export const apiPlatformApiNoSystemRouteRef = createRouteRef({
  id: 'api-platform-api-no-system',
  params: [ 'name' ],
});

export const apiPlatformServiceRouteRef = createRouteRef({
  id: 'api-platform-service',
});

export const apiPlatformServiceDefinitionRouteRef = createRouteRef({
  id: 'api-platform-service-definition',
  params: [ 'system', 'name' ],
});

export const apiPlatformSystemRouteRef = createRouteRef({
  id: 'api-platform-system',
});

export const apiPlatformSystemDefinitionRouteRef = createRouteRef({
  id: 'api-platform-system-definition',
  params: [ 'system', 'name' ],
});

export const apiPlatformLibraryRouteRef = createRouteRef({
  id: 'api-platform-library',
});

export const apiPlatformLibraryDefinitionRouteRef = createRouteRef({
  id: 'api-platform-library-definition',
  params: [ 'system', 'name' ],
});
