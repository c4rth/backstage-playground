import { PropsWithChildren } from 'react';
import { makeStyles } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import CreateComponentIcon from '@material-ui/icons/AddCircleOutline';
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
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
// Notifications
import { NotificationsSidebarItem } from '@backstage/plugin-notifications';
// Entity Validation
import BuildIcon from '@material-ui/icons/Build';
import { useApp } from '@backstage/core-plugin-api';
// Permission on menu
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { taskCreatePermission } from '@backstage/plugin-scaffolder-common/alpha';
// Api Platform
import CodeIcon from '@material-ui/icons/Code';
import MuiMemoryIcon from '@material-ui/icons/Memory';
import { ApiPlatformSearchResultListItem } from '@internal/plugin-api-platform';
// Search
import { CatalogSearchResultListItem } from '@backstage/plugin-catalog';
import { TechDocsSearchResultListItem } from '@backstage/plugin-techdocs';
import { devToolsAdministerPermission } from '@backstage/plugin-devtools-common';
import { adminToolsPermission } from '@internal/plugin-permissions-common';
import { McaComponentSearchResultListItem } from '@internal/plugin-mca-components';

const useSidebarLogoStyles = makeStyles({
  root: {
    width: sidebarConfig.drawerWidthClosed,
    height: 3 * sidebarConfig.logoHeight,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginBottom: -14,
  },
  link: {
    width: sidebarConfig.drawerWidthClosed,
    marginLeft: 24,
  },
});

const SidebarLogo = () => {
  const classes = useSidebarLogoStyles();
  const { isOpen } = useSidebarOpenState();

  return (
    <div className={classes.root}>
      <Link to="/" underline="none" className={classes.link} aria-label="Home">
        {isOpen ? <LogoFull /> : <LogoIcon />}
      </Link>
    </div>
  );
};

export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      <SidebarLogo />
      <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
        <SidebarSearchModal resultItemComponents={[
          <ApiPlatformSearchResultListItem icon={<CatalogIcon />} />,
          <McaComponentSearchResultListItem icon={<CodeIcon />} />,
          <CatalogSearchResultListItem icon={<CatalogIcon />} />,
          <TechDocsSearchResultListItem icon={<DocsIcon />} />
        ]} />
      </SidebarGroup>
      <SidebarDivider />
      <SidebarGroup label="Menu" icon={<MenuIcon />}>
        {/* Global nav, not org-specific */}
        <SidebarItem icon={HomeIcon} to="/" text="Home" />
        <SidebarItem icon={HomeIcon} to="catalog" text="Catalog">
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
            <SidebarDivider />
            <SidebarSubmenuItem icon={CodeIcon} to="api-docs" title="APIs" />
            <SidebarSubmenuItem icon={MuiMemoryIcon} to="catalog?filters[kind]=component&filters[type]=service" title="Services" />
            <SidebarSubmenuItem icon={useApp().getSystemIcon('kind:system')} to="catalog?filters[kind]=system" title="Systems" />
          </SidebarSubmenu>
        </SidebarItem>
        <SidebarItem icon={useApp().getSystemIcon('kind:system')!} to="api-platform/system" text="Systems" />
        <SidebarItem icon={MuiMemoryIcon} to="api-platform/service" text="Services" />
        <SidebarItem icon={CodeIcon} to="api-platform/api" text="API Platform" />
        <SidebarItem icon={CodeIcon} text="MCA">
          <SidebarSubmenu title="MCA">
            <SidebarSubmenuItem icon={CodeIcon} to="mca-components/components" title="Components" />
            <SidebarSubmenuItem icon={CodeIcon} to="mca-components/basetypes" title="BaseTypes" />
          </SidebarSubmenu>
        </SidebarItem>
        <SidebarItem icon={LibraryBooks} to="docs" text="Docs" />
        <SidebarItem icon={LibraryBooks} to="external-docs" text="ExtDocs" />
        <RequirePermission permission={taskCreatePermission} errorPage={<div />} >
          <SidebarItem
            icon={CreateComponentIcon}
            to="create" text="Scaffolder" />
        </RequirePermission>
        <RequirePermission permission={adminToolsPermission} errorPage={<div />} >
          <SidebarItem icon={BuildIcon} text="Tools">
            <SidebarSubmenu title="Tools">
              <SidebarSubmenuItem icon={BuildIcon} to="entity-validation" title="Entity Validator" />
              <RequirePermission permission={catalogEntityCreatePermission} errorPage={<div />}>
                <SidebarSubmenuItem icon={BuildIcon} to="catalog-import" title="Catalog Import" />
              </RequirePermission>
            </SidebarSubmenu>
          </SidebarItem>
        </RequirePermission>
        {/* End global nav */}
        <SidebarScrollWrapper>
          {/* Items in this group will be scrollable if they run out of space */}
        </SidebarScrollWrapper>
      </SidebarGroup>
      <SidebarSpace />
      <SidebarDivider />
      <RequirePermission permission={devToolsAdministerPermission} errorPage={<div />} >
        <SidebarItem icon={BuildIcon} to="devtools" text="Admin" />
      </RequirePermission>
      <NotificationsSidebarItem
        titleCounterEnabled
        snackbarEnabled={false}
      />
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
