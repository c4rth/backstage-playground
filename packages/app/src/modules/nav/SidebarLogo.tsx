import {
  sidebarConfig,
  useSidebarOpenState,
} from '@backstage/core-components';
import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';
import { LogoFull } from './LogoFull';
import { LogoIcon } from './LogoIcon';
import styles from './SidebarLogo.module.css';
import { Link } from '@backstage/ui';

export const SidebarLogo = () => {
  const { isOpen } = useSidebarOpenState();
  const appThemeApi = useApi(appThemeApiRef);
  const themeId = appThemeApi.getActiveThemeId();

  const fullLogo = <LogoFull />;
  const iconLogo = <LogoIcon />;

  return (
    <div
      className={styles.root}
      style={{
        width: sidebarConfig.drawerWidthClosed,
        height: 3 * sidebarConfig.logoHeight,
      }}
    >
      <Link
        href="/"
        style={{
          width: sidebarConfig.drawerWidthClosed,
          marginLeft: themeId === 'aperture' ? 15 : 24,
        }}
      >
        {isOpen ? fullLogo : iconLogo}
      </Link>
    </div>
  );
};
