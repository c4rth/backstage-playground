import { createPlugin } from '@backstage/core-plugin-api';
import {
  createTechDocsAddonExtension,
  TechDocsAddonLocations,
} from '@backstage/plugin-techdocs-react';

import { MermaidAddon } from './Mermaid';
import type { MermaidProps } from './Mermaid';

/**
 * The TechDocs addons mermaid plugin
 *
 * @public
 */

export const techdocsAddonMermaidPlugin = createPlugin({
  id: 'techdocs-addon-mermaid',
});

/**
 * TechDocs addon that lets you render Mermaid diagrams
 *
 * @public
 */

export const Mermaid = techdocsAddonMermaidPlugin.provide(
  createTechDocsAddonExtension<MermaidProps>({
    name: 'MermaidDiagram',
    location: TechDocsAddonLocations.Content,
    component: MermaidAddon,
  }),
);
