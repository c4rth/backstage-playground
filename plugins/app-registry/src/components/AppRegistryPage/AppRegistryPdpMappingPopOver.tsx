import React, { PropsWithChildren, useMemo, useState } from 'react';
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
import { AppRegistryOperation } from '../../types';
import { CardHeader, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

export type AppRegistryPdpMappingPopOverProps = PropsWithChildren<{
  operation: AppRegistryOperation;
  delayTime?: number;
}>;

const useStyles = makeStyles(() => {
  return {
    popoverPaper: {
      width: '30em',
    },
    descriptionTypography: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
    },
  };
});

export const AppRegistryPdpMappingPopOver = (props: AppRegistryPdpMappingPopOverProps) => {
  const { operation, children, delayTime = 500 } = props;
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
          PaperProps={{
            className: classes.popoverPaper,
          }}
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
            <CardHeader title="PDP Mapping" />
            <CardContent>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant='button'>Value Path</Typography></TableCell>
                    <TableCell><Typography variant='button'>PDP Field</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {operation.pdpMapping?.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {row.valuePath}
                      </TableCell>
                      <TableCell>{row.pdpField}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </HoverPopover>
      )}
    </>
  );
};