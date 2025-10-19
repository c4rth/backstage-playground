import { SyntheticEvent, useEffect, useState } from 'react';
import { IconComponent } from '@backstage/core-plugin-api';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import useCopyToClipboard from 'react-use/esm/useCopyToClipboard';
import { RiFileCopyFill, RiBug2Fill, RiMore2Fill  } from '@remixicon/react'

// TODO-MUI
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Popover from '@material-ui/core/Popover';
import Tooltip from '@material-ui/core/Tooltip';
import { Theme, makeStyles } from '@material-ui/core/styles';

/** @public */
export type EntityContextMenuClassKey = 'button';

const useStyles = makeStyles(
  (theme: Theme) => {
    return {
      button: {
        color: theme.page.fontColor,
      },
    };
  },
  { name: 'PluginCatalogEntityContextMenu' },
);

// NOTE(freben): Intentionally not exported at this point, since it's part of
// the unstable extra context menu items concept below
interface ExtraContextMenuItem {
  title: string;
  Icon: IconComponent;
  onClick: () => void;
}

interface ComponentHeaderContextMenuProps {
  UNSTABLE_extraContextMenuItems?: ExtraContextMenuItem[];
  contextMenuItems?: React.JSX.Element[];
}

export function ComponentHeaderContextMenu(props: ComponentHeaderContextMenuProps) {
  const {
    UNSTABLE_extraContextMenuItems,
    contextMenuItems,
  } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();
  const classes = useStyles();

  const onOpen = (event: SyntheticEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onClose = () => {
    setAnchorEl(undefined);
  };

  const alertApi = useApi(alertApiRef);
  const [copyState, copyToClipboard] = useCopyToClipboard();
  useEffect(() => {
    if (!copyState.error && copyState.value) {
      alertApi.post({
        message: 'entityContextMenu.copiedMessage',
        severity: 'info',
        display: 'transient',
      });
    }
  }, [copyState, alertApi]);

  const extraItems = UNSTABLE_extraContextMenuItems && [
    ...UNSTABLE_extraContextMenuItems.map(item => (
      <MenuItem
        key={item.title}
        onClick={() => {
          onClose();
          item.onClick();
        }}
      >
        <ListItemIcon>
          <item.Icon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={item.title} />
      </MenuItem>
    )),
    <Divider key="the divider is here!" />,
  ];

  return (
    <>
      <Tooltip title='entityContextMenu.moreButtonTitle' arrow>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          aria-expanded={!!anchorEl}
          role="button"
          onClick={onOpen}
          data-testid="menu-button"
          className={classes.button}
          id="long-menu"
        >
          <RiMore2Fill />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        aria-labelledby="long-menu"
        PaperProps={{
          style: { minWidth: 200 },
        }}
      >
        <MenuList autoFocusItem={Boolean(anchorEl)}>
          {extraItems}
          {contextMenuItems === undefined ? (
            <>
              <MenuItem
                onClick={() => {
                  onClose();
                }}
              >
                <ListItemIcon>
                  <RiBug2Fill fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary='entityContextMenu.inspectMenuTitle'
                />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onClose();
                  copyToClipboard(window.location.toString());
                }}
              >
                <ListItemIcon>
                  <RiFileCopyFill fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary='entityContextMenu.copyURLMenuTitle'
                />
              </MenuItem>
            </>
          ) : (
            <>XXX</>
          )}
        </MenuList>
      </Popover>
    </>
  );
}