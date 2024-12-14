import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { apiPlatformPlugin, ApiPlatformPage } from '../src/plugin';

createDevApp()
  .registerPlugin(apiPlatformPlugin)
  .addPage({
    element: <ApiPlatformPage />,
    title: 'Root Page',
    path: '/api-platform',
  })
  .render();
