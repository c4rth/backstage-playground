import { NavContentBlueprint } from '@backstage/plugin-app-react';
import { SidebarLogo } from './SidebarLogo';

import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Sidebar,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarScrollWrapper,
  SidebarSpace,
  SidebarSubmenu,
  SidebarSubmenuItem,
  CatalogIcon,
  DocsIcon,
} from '@backstage/core-components';

import {
  RiMenuFill,
  RiMenuSearchLine,
  RiHome2Fill,
  RiCpuLine,
  RiFileCopy2Line,
  RiBookShelfLine,
  RiToolsFill,
  RiWrenchFill,
  RiAdminLine,
  RiBubbleChartLine,
  RiAlbumLine,
  RiPuzzleFill,
  RiShapesFill,
  RiHeartPulseFill,
} from '@remixicon/react';
import { IconComponent } from '@backstage/core-plugin-api';
// Permission on menu
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
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
  adminToolsPermission,
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
      return (
        <Sidebar>
          <SidebarLogo />
          <SidebarGroup to="/search">
            <SidebarSearchModal
              icon={RiMenuSearchLine as IconComponent}
              resultItemComponents={[
                <ApiSearchResultListItem icon={<CatalogIcon />} />,
                <McaComponentSearchResultListItem icon={<RiBubbleChartLine />} />,
                <CatalogSearchResultListItem icon={<CatalogIcon />} />,
                <TechDocsSearchResultListItem icon={<DocsIcon />} />,
              ]}
            />
          </SidebarGroup>
          <SidebarDivider />
          <SidebarGroup label="Menu" icon={<RiMenuFill />}>
            <SidebarItem icon={RiHome2Fill as IconComponent} to="/" text="Home" />
            <SidebarItem
              icon={RiShapesFill as IconComponent}
              to="api-platform/system"
              text="Systems"
            />
            <SidebarItem
              icon={RiCpuLine as IconComponent}
              to="api-platform/service"
              text="Services"
            />
            <SidebarItem
              icon={RiPuzzleFill as IconComponent}
              to="api-platform/api"
              text="APIs"
            />
            <RequirePermission
              permission={advancedUserPermission}
              errorPage={<div />}
            >
              <SidebarItem
                icon={RiBookShelfLine as IconComponent}
                to="api-platform/library"
                text="Libraries"
              />
            </RequirePermission>
            <SidebarItem
              icon={RiBubbleChartLine as IconComponent}
              to="mca/components"
              text="MCA Operations"
            />
            <SidebarItem
              icon={RiAlbumLine as IconComponent}
              to="mca/basetypes"
              text="MCA BaseTypes"
            />
            <SidebarItem
              icon={RiHeartPulseFill as IconComponent}
              to="health-dashboard"
              text="Health Dashboard"
            />
            <SidebarItem
              icon={RiFileCopy2Line as IconComponent}
              to="docs"
              text="Docs"
            />
            <SidebarItem
              icon={RiFileCopy2Line as IconComponent}
              to="external-docs"
              text="ExtDocs"
            />
            <RequirePermission
              permission={taskCreatePermission}
              errorPage={<div />}
            >
              {nav.take('page:scaffolder')}
            </RequirePermission>
            <RequirePermission permission={notGuestPermission} errorPage={<div />}>
              <SidebarItem icon={RiBookShelfLine as IconComponent} text="Catalog">
                <SidebarSubmenu title="Catalog">
                  {nav.take('page:catalog')}
                  <RequirePermission
                    permission={adminToolsPermission}
                    errorPage={<div />}
                  >
                    <SidebarDivider />
                    <SidebarSubmenuItem
                      icon={RiToolsFill as IconComponent}
                      to="entity-validation"
                      title="Entity Validator"
                    />
                    <RequirePermission
                      permission={catalogEntityCreatePermission}
                      errorPage={<div />}
                    >
                      <SidebarSubmenuItem
                        icon={RiToolsFill as IconComponent}
                        to="catalog-import"
                        title="Catalog Import"
                      />
                    </RequirePermission>
                  </RequirePermission>
                </SidebarSubmenu>
              </SidebarItem>
            </RequirePermission>
            <SidebarItem
              icon={RiWrenchFill as IconComponent}
              text="DevTools"
              to="tools"
            />
            {/* End global nav */}
            <SidebarScrollWrapper>
              {/* Items in this group will be scrollable if they run out of space */}
            </SidebarScrollWrapper>
          </SidebarGroup>
          <SidebarSpace />
          <Shortcuts />
          <SidebarDivider />
          <RequirePermission
            permission={devToolsAdministerPermission}
            errorPage={<div />}
          >
            <SidebarItem
              icon={RiAdminLine as IconComponent}
              to="admin"
              text="Admin"
            />
          </RequirePermission>

          <SidebarGroup
            label="Settings"
            icon={<UserSettingsSignInAvatar />}
            to="/settings"
          >
            <SidebarSettings />
          </SidebarGroup>
        </Sidebar>
      );
    },
  },
});
