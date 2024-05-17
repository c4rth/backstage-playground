import { createPlugin } from '@backstage/core-plugin-api';
import {
  createTechDocsAddonExtension,
  TechDocsAddonLocations,
} from '@backstage/plugin-techdocs-react';
import { CustomStylesAddon } from './addon/CustomStyles';


export const techdocsAddonCustomStylesPlugin = createPlugin({
  id: 'techdocs-addon-custom-styles',
});


 export const CustomStyles = techdocsAddonCustomStylesPlugin.provide(
  createTechDocsAddonExtension({
    name: 'CustomStyles',
    location: TechDocsAddonLocations.Content,
    component: CustomStylesAddon,
  }),
);