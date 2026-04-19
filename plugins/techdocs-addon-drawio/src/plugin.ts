import { createPlugin } from '@backstage/core-plugin-api';
import {
  createTechDocsAddonExtension,
  TechDocsAddonLocations,
} from '@backstage/plugin-techdocs-react';
import { DrawIoAddOn } from './DrawIo';
import type { DrawIoProps } from './DrawIo';

export const techdocsAddonDrawIoPlugin = createPlugin({
  id: 'techdocs-addon-drawio',
});

export const DrawIo = techdocsAddonDrawIoPlugin.provide(
  createTechDocsAddonExtension<DrawIoProps>({
    name: 'DrawIoDiagram',
    location: TechDocsAddonLocations.Content,
    component: DrawIoAddOn,
  }),
);
