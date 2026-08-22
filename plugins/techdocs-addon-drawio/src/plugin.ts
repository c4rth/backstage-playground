import { createElement } from 'react';
import {
  AddonBlueprint,
  TechDocsAddonOptions,
} from '@backstage/plugin-techdocs-react/alpha';
import {
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { DrawIoAddOn } from './DrawIo';
import type { DrawIoProps } from './DrawIo';


const ConfiguredDrawIoAddon = () => {

  const props: DrawIoProps = {};

  return createElement(DrawIoAddOn, props);
};

const drawIoAddonParams: TechDocsAddonOptions = {
  name: 'DrawIo',
  location: 'Content',
  component: ConfiguredDrawIoAddon,
};

export const techDocsDrawIoAddon = AddonBlueprint.make({
  name: 'drawio',
  params: drawIoAddonParams,
});

export const techDocsDrawIoAddonModule = createFrontendModule({
  pluginId: 'techdocs',
  extensions: [techDocsDrawIoAddon],
});

export { techDocsDrawIoAddonModule as default };