import { PropsWithChildren } from 'react';
import LogoFull from './LogoFull';
import LogoIcon from './LogoIcon';
import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Sidebar,
  sidebarConfig,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarPage,
  SidebarScrollWrapper,
  SidebarSpace,
  useSidebarOpenState,
  Link,
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
  RiStackLine,
  RiFolderAddLine,
  RiBubbleChartLine,
  RiAlbumLine,
} from '@remixicon/react';


// Entity Validation
import { IconComponent, useApp } from '@backstage/core-plugin-api';
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
import { adminToolsPermission, notGuestPermission } from '@internal/plugin-permissions-common';
import { Shortcuts } from '@backstage-community/plugin-shortcuts';

const SidebarLogo = () => {
  const { isOpen } = useSidebarOpenState();

  return (
    <div style={{
      width: sidebarConfig.drawerWidthClosed,
      height: 3 * sidebarConfig.logoHeight,
      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'center',
      marginBottom: -14,
    }}>
      <Link to="/" underline="none" style={{
        width: sidebarConfig.drawerWidthClosed,
        marginLeft: 24,
      }}>
        {isOpen ? <LogoFull /> : <LogoIcon />}
      </Link>
    </div>
  );
};

export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      <SidebarLogo />
      <SidebarGroup to="/search">
        <SidebarSearchModal icon={RiMenuSearchLine as IconComponent} resultItemComponents={[
          <ApiSearchResultListItem icon={<CatalogIcon />} />,
          <McaComponentSearchResultListItem icon={<RiStackLine />} />,
          <CatalogSearchResultListItem icon={<CatalogIcon />} />,
          <TechDocsSearchResultListItem icon={<DocsIcon />} />
        ]} />
      </SidebarGroup>
      <SidebarDivider />
      <SidebarGroup label="Menu" icon={<RiMenuFill />}>
        <SidebarItem icon={RiHome2Fill as IconComponent} to="/" text="Home" />
        <SidebarItem icon={useApp().getSystemIcon('kind:system')!} to="api-platform/system" text="Systems" />
        <SidebarItem icon={RiCpuLine as IconComponent} to="api-platform/service" text="Services" />
        <SidebarItem icon={useApp().getSystemIcon('kind:api')!} to="api-platform/api" text="APIs" />
        <SidebarItem icon={RiBookShelfLine as IconComponent} to="api-platform/library" text="Libraries" />
        <SidebarItem icon={RiBubbleChartLine as IconComponent} to="mca/components" text="MCA" />
        <SidebarItem icon={RiAlbumLine as IconComponent} to="mca/basetypes" text="MCA BaseTypes" />
        <SidebarItem icon={RiFileCopy2Line as IconComponent} to="docs" text="Docs" />
        <SidebarItem icon={RiFileCopy2Line as IconComponent} to="external-docs" text="ExtDocs" />
        <RequirePermission permission={taskCreatePermission} errorPage={<div />} >
          <SidebarItem
            icon={RiFolderAddLine as IconComponent}
            to="create" text="Scaffolder" />
        </RequirePermission>
        <RequirePermission permission={notGuestPermission} errorPage={<div />} >
          <SidebarItem icon={RiBookShelfLine as IconComponent} to="catalog" text="Catalog">
            <SidebarSubmenu title="Catalog">
              <SidebarSubmenuItem
                title="Domains"
                to="catalog?filters[kind]=domain"
                icon={useApp().getSystemIcon('kind:domain')}
              />
              <SidebarSubmenuItem
                title="Systems"
                to="catalog?filters[kind]=system"
                icon={useApp().getSystemIcon('kind:system')}
              />
              <SidebarSubmenuItem
                title="Components"
                to="catalog?filters[kind]=component"
                icon={useApp().getSystemIcon('kind:component')}
              />
              <SidebarDivider />
              <SidebarSubmenuItem
                title="Resources"
                to="catalog?filters[kind]=resource"
                icon={useApp().getSystemIcon('kind:resource')}
              />
              <SidebarSubmenuItem
                title="Location"
                to="catalog?filters[kind]=location"
                icon={useApp().getSystemIcon('kind:location')}
              />
              <SidebarDivider />
              <SidebarSubmenuItem
                title="Groups"
                to="catalog?filters[kind]=group"
                icon={useApp().getSystemIcon('kind:group')}
              />
              <SidebarSubmenuItem
                title="Users"
                to="catalog?filters[kind]=user"
                icon={useApp().getSystemIcon('kind:user')}
              />
              <RequirePermission permission={adminToolsPermission} errorPage={<div />} >
                <SidebarDivider />
                <SidebarSubmenuItem icon={RiToolsFill as IconComponent} to="entity-validation" title="Entity Validator" />
                <RequirePermission permission={catalogEntityCreatePermission} errorPage={<div />}>
                  <SidebarSubmenuItem icon={RiToolsFill as IconComponent} to="catalog-import" title="Catalog Import" />
                </RequirePermission>
              </RequirePermission>
            </SidebarSubmenu>
          </SidebarItem>
          <SidebarItem icon={RiWrenchFill as IconComponent} text="DevTools" to="tools" />
        </RequirePermission>
        {/* End global nav */}
        <SidebarScrollWrapper>
          {/* Items in this group will be scrollable if they run out of space */}
        </SidebarScrollWrapper>
      </SidebarGroup>
      <SidebarSpace />
      <Shortcuts />
      <SidebarDivider />
      <RequirePermission permission={devToolsAdministerPermission} errorPage={<div />} >
        <SidebarItem icon={RiAdminLine as IconComponent} to="devtools" text="Admin" />
      </RequirePermission>

      <SidebarGroup
        label="Settings"
        icon={<UserSettingsSignInAvatar />}
        to="/settings"
      >
        <SidebarSettings />
      </SidebarGroup>
    </Sidebar>
    {children}
  </SidebarPage >
);
