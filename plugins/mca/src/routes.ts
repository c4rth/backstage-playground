import { createRouteRef } from '@backstage/core-plugin-api';

export const componentsRouteRef = createRouteRef({
  id: 'mca-components',
});

export const componentRouteRef = createRouteRef({
  id: 'mca-component',
  params: ['name'],
});

export const baseTypesRouteRef = createRouteRef({
  id: 'mca-basetypes',
});

export const baseTypeRouteRef = createRouteRef({
  id: 'mca-basetype',
  params: ['name'],
});
