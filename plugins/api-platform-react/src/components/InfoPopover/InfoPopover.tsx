import React, { PropsWithChildren, ReactNode, useMemo, useState } from 'react';
import HoverPopover from 'material-ui-popup-state/HoverPopover';
import {
  bindHover,
  bindPopover,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { debounce } from 'lodash';
import { CardHeader } from '@material-ui/core';
import { Variant } from '@material-ui/core/styles/createTypography';

export type InfoPopoverProps = PropsWithChildren<{
  title: string;
  variant?: Variant;
  delayTime?: number;
  content?: ReactNode;
}>;

const useStyles = makeStyles(() => {
  return {
    popoverPaper: {
      width: '30em',
    },
  };
});

export const InfoPopover = (props: InfoPopoverProps) => {
  const { children, delayTime = 500 } = props;
  const classes = useStyles();
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'entity-peek-ahead',
  });
  const [isHovered, setIsHovered] = useState(false);

  const debouncedHandleMouseEnter = useMemo(
    () => debounce(() => setIsHovered(true), delayTime),
    [delayTime],
  );

  const handleOnMouseLeave = () => {
    setIsHovered(false);
    debouncedHandleMouseEnter.cancel();
  };

  return (
    <>
      <Typography component="span" onMouseEnter={debouncedHandleMouseEnter}>
        <Typography
          component="span"
          data-testid="trigger"
          {...bindHover(popupState)}
        >
          {children}
        </Typography>
      </Typography>
      {isHovered && (
        <HoverPopover
          slotProps={{ paper: { className: classes.popoverPaper, } }}
          {...bindPopover(popupState)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          onMouseLeave={handleOnMouseLeave}
        >
          <Card>
            <CardHeader title={props.title} titleTypographyProps={{ variant: props.variant || 'h6' }} />
            <CardContent>
              {props.content}
            </CardContent>
          </Card>
        </HoverPopover>
      )}
    </>
  );
};