import { sidebarConfig, useSidebarOpenState } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { LogoFull, LogoIcon } from '../brand';
import styles from './SidebarLogo.module.css';
import { Link } from '@backstage/ui';
import {
  coreApis,
} from '@backstage/frontend-plugin-api';

export const SidebarLogo = () => {
  const { isOpen } = useSidebarOpenState();
  const appThemeApi = useApi(coreApis.appTheme);
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
