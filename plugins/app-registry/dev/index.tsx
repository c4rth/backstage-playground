import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { appRegistryPlugin, AppRegistryPage } from '../src/plugin';

createDevApp()
  .registerPlugin(appRegistryPlugin)
  .addPage({
    element: <AppRegistryPage />,
    title: 'Root Page',
    path: '/app-registry',
  })
  .render();
