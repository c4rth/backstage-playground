import { NavContentBlueprint } from '@backstage/plugin-app-react';
import { SidebarLogo } from './SidebarLogo';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Sidebar,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarScrollWrapper,
  SidebarSpace,
  CatalogIcon,
  DocsIcon,
} from '@backstage/core-components';

import { RiMenuSearchLine, RiBubbleChartLine } from '@remixicon/react';
import { IconComponent } from '@backstage/core-plugin-api';
// Permission on menu
import { RequirePermission } from '@backstage/plugin-permission-react';
import { taskCreatePermission } from '@backstage/plugin-scaffolder-common/alpha';
// Api Platform
import { ApiSearchResultListItem } from '@internal/plugin-api-platform';
// Search
import { CatalogSearchResultListItem } from '@backstage/plugin-catalog';
import { TechDocsSearchResultListItem } from '@backstage/plugin-techdocs';
import { McaComponentSearchResultListItem } from '@internal/plugin-mca';
// Admin Tools
import { devToolsAdministerPermission } from '@backstage/plugin-devtools-common';
import {
  notGuestPermission,
  advancedUserPermission,
} from '@internal/plugin-permissions-common';
import { Shortcuts } from '@backstage-community/plugin-shortcuts';

export const SidebarContent = NavContentBlueprint.make({
  params: {
    component: ({ navItems }) => {
      const nav = navItems.withComponent(item => (
        <SidebarItem icon={() => item.icon} to={item.href} text={item.title} />
      ));

      nav.take('page:search'); // Using search modal instead
      
      return (
        <Sidebar>
          <SidebarLogo />
          <SidebarGroup to="/search">
            <SidebarSearchModal
              icon={RiMenuSearchLine as IconComponent}
              resultItemComponents={[
                <ApiSearchResultListItem icon={<CatalogIcon />} />,
                <McaComponentSearchResultListItem
                  icon={<RiBubbleChartLine />}
                />,
                <CatalogSearchResultListItem icon={<CatalogIcon />} />,
                <TechDocsSearchResultListItem icon={<DocsIcon />} />,
              ]}
            />
          </SidebarGroup>
          <SidebarDivider />
          {nav.take('page:home')}
          {nav.take('page:api-platform/system-explorer')}
          {nav.take('page:api-platform/service-explorer')}
          {nav.take('page:api-platform/api-explorer')}
          <RequirePermission
            permission={advancedUserPermission}
            errorPage={<div />}
          >
            {nav.take('page:api-platform/library-explorer')}
          </RequirePermission>
          {nav.take('page:mca/mca-components')}
          {nav.take('page:mca/mca-basetypes')}
          {nav.take('page:health-dashboard/health-dashboard')}
          {nav.take('page:techdocs')}
          <RequirePermission
            permission={taskCreatePermission}
            errorPage={<div />}
          >
            {nav.take('page:scaffolder')}
          </RequirePermission>
          <RequirePermission
            permission={notGuestPermission}
            errorPage={<div />}
          >
            {nav.take('page:catalog')}
          </RequirePermission>
          {nav.take('page:toolkit/toolkit')}
          {/* End global nav */}
          <SidebarScrollWrapper>
            {/* Items in this group will be scrollable if they run out of space */}
          </SidebarScrollWrapper>
          <SidebarSpace />
          <Shortcuts />
          <SidebarDivider />

          <RequirePermission
            permission={devToolsAdministerPermission}
            errorPage={<div />}
          >
            {nav.take('page:app-visualizer')}
            {nav.take('page:devtools')}
          </RequirePermission>
          {nav.take('page:user-settings')}
        </Sidebar>
      );
    },
  },
});
