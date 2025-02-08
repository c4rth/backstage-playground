import React, { PropsWithChildren } from 'react';
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
} from '@backstage/core-components';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
// Notifications
import { NotificationsSidebarItem } from '@backstage/plugin-notifications';
// Q&A
// import LiveHelpIcon from '@material-ui/icons/LiveHelp';
// Entity Validation
import BuildIcon from '@material-ui/icons/Build';
import { useApp } from '@backstage/core-plugin-api';
// Permission on menu
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
// Api Platform
import CodeIcon from '@material-ui/icons/Code';
import MuiMemoryIcon from '@material-ui/icons/Memory';
// Kiali
import { KialiIcon } from '@backstage-community/plugin-kiali';

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
        <SidebarSearchModal />
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
        <SidebarItem icon={useApp().getSystemIcon('kind:system')!} to="api-platform/system" text="Teams" />
        <SidebarItem icon={MuiMemoryIcon} to="api-platform/service" text="Services" />
        <SidebarItem icon={CodeIcon} to="api-platform/api" text="API Platform" />
        <SidebarItem icon={LibraryBooks} to="docs" text="Docs" />
        <SidebarItem icon={CreateComponentIcon} to="create" text="Scaffolder" />
        <SidebarItem icon={BuildIcon} text="Tools">
          <SidebarSubmenu title="Tools">
            <SidebarSubmenuItem icon={BuildIcon} to="entity-validation" title="Entity Validator" />
            <RequirePermission permission={catalogEntityCreatePermission}
              children={<SidebarSubmenuItem icon={BuildIcon} to="catalog-import" title="Catalog Import" />}
              errorPage={<div />}
            />
            <SidebarDivider />
          <SidebarSubmenuItem icon={KialiIcon} to="kiali" title="Kiali" />
          </SidebarSubmenu>
        </SidebarItem>        {/* End global nav */}
        <SidebarDivider />
        <SidebarScrollWrapper>
          {/* Items in this group will be scrollable if they run out of space */}
        </SidebarScrollWrapper>
      </SidebarGroup>
      <SidebarSpace />
      <SidebarDivider />
      <NotificationsSidebarItem />
      <SidebarGroup
        label="Settings"
        icon={<UserSettingsSignInAvatar />}
        to="/settings"
      >
        <SidebarSettings />
      </SidebarGroup>
    </Sidebar>
    {children}
  </SidebarPage>
);
