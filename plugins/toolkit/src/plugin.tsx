import { RiWrenchFill } from '@remixicon/react';
import {
  PageBlueprint,
  createFrontendPlugin,
  createRouteRef,
} from '@backstage/frontend-plugin-api';

const rootRouteRef = createRouteRef();

const toolsPage = PageBlueprint.make({
  name: 'toolkit',
  params: {
    path: '/toolkit',
    routeRef: rootRouteRef,
    loader: () => import('./components/ToolsPage').then(m => <m.ToolsPage />),
  },
});

export default createFrontendPlugin({
  pluginId: 'toolkit',
  title: 'Dev Tools',
  icon: <RiWrenchFill />,
  routes: {
    root: rootRouteRef,
  },
  extensions: [toolsPage],
});
