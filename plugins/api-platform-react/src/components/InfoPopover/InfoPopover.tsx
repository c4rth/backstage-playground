import { PropsWithChildren, ReactNode, useCallback, useMemo, useState } from 'react';
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
  title?: string;
  variant?: Variant;
  delayTime?: number;
  content?: ReactNode;
}>;

const useStyles = makeStyles(() => {
  return {
    popoverPaper: {
      width: '30em',
    },
    triggerContainer: {
      display: 'inline',
    },
  };
});

export const InfoPopOver = (props: InfoPopoverProps) => {

  const { children, delayTime = 500, title, variant = 'h6', content } = props;
  const classes = useStyles();
  const [isHovered, setIsHovered] = useState(false);

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'info-popover',
  });

  const debouncedHandleMouseEnter = useMemo(
    () => debounce(() => setIsHovered(true), delayTime),
    [delayTime],
  );

  const handleOnMouseLeave = useCallback(() => {
    setIsHovered(false);
    debouncedHandleMouseEnter.cancel();
  }, [debouncedHandleMouseEnter]);

  const popoverProps = useMemo(() => ({
    slotProps: { paper: { className: classes.popoverPaper } },
    ...bindPopover(popupState),
    anchorOrigin: { vertical: 'bottom' as const, horizontal: 'center' as const },
    transformOrigin: { vertical: 'top' as const, horizontal: 'center' as const },
    onMouseLeave: handleOnMouseLeave,
  }), [classes.popoverPaper, popupState, handleOnMouseLeave]);

  const triggerProps = useMemo(() => ({
    component: "span" as const,
    className: classes.triggerContainer,
    onMouseEnter: debouncedHandleMouseEnter,
    ...bindHover(popupState),
    'data-testid': 'trigger',
  }), [classes.triggerContainer, debouncedHandleMouseEnter, popupState]);

  const cardHeaderProps = useMemo(() => ({
    title,
    titleTypographyProps: { variant },
  }), [title, variant]);

  if (!content && !title) {
    return <>{children}</>;
  }

  return (
    <>
      <Typography {...triggerProps}>
        {children}
      </Typography>
      {isHovered && (
        <HoverPopover {...popoverProps}>
          <Card>
            {title && <CardHeader {...cardHeaderProps} />}
            {content && <CardContent>{content}</CardContent>}
          </Card>
        </HoverPopover>
      )}
    </>
  );
}