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
import { compatWrapper } from '@backstage/core-compat-api';
import { NavContentBlueprint } from '@backstage/plugin-app-react';
import { SidebarLogo } from './SidebarLogo';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
    UserSettingsSignInAvatar,
    Settings as SidebarSettings,
} from '@backstage/plugin-user-settings';

import { Shortcuts } from '@backstage-community/plugin-shortcuts';
import { FeatureFlagged } from '@backstage/core-app-api';

// Search
import { ApiSearchResultListItem } from '@internal/plugin-api-platform';
import { CatalogSearchResultListItem } from '@backstage/plugin-catalog';
import { TechDocsSearchResultListItem } from '@backstage/plugin-techdocs';
import { McaComponentSearchResultListItem } from '@internal/plugin-mca';

// Permission on menu
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { taskCreatePermission } from '@backstage/plugin-scaffolder-common/alpha';
import { devToolsAdministerPermission } from '@backstage/plugin-devtools-common';
import { adminToolsPermission, notGuestPermission } from '@internal/plugin-permissions-common';

// Icons
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


export const SidebarContent = NavContentBlueprint.make({
    params: {
        component: ({ navItems }) => {
            const nav = navItems.withComponent(item => (
                <SidebarItem icon={() => item.icon} to={item.href} text={item.title} />
            ));
            return compatWrapper(
                <Sidebar>
                    <SidebarLogo />
                    <SidebarDivider />
                    <SidebarGroup label="Menu" icon={<RiMenuFill />}>
                        {nav.take('page:home')}
                        {nav.take('page:catalog')}
                        {nav.take('page:techdocs')}
                        <SidebarDivider />

                    </SidebarGroup>
                </Sidebar>,
            );
        },
    },
});
