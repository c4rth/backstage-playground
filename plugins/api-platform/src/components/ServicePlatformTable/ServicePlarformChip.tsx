import React from 'react';
import { Chip, Tooltip, Typography } from '@material-ui/core';
import { alpha, makeStyles, Theme } from '@material-ui/core/styles';
import { ServiceEnvironmentDefinition } from '@internal/plugin-api-platform-common';

export type ServicePlatformChipProps = {
    index: number;
    text?: string;
    service?: ServiceEnvironmentDefinition;
};

const useStyles = makeStyles<Theme, ServicePlatformChipProps>(
    (theme: Theme) => ({
        badge: {
            backgroundColor: (props: ServicePlatformChipProps) => alpha(theme.palette.primary.light, (props.index + 1) / 10),
        },
    }),
);

export const ServicePlatformChip = (
    props: ServicePlatformChipProps,
): JSX.Element => {
    const classes = useStyles(props);

    return (
        props.text ?
            <Chip
                key={props.text}
                label={props.text}
                size="small"
                variant="outlined"
                className={classes.badge}
            />
            :
            <Tooltip
                placement='bottom'
                arrow
                title={
                    <React.Fragment>
                        <Typography variant='caption'>Name: <b>{props.service?.containerName}</b></Typography><br/>
                        <Typography variant='caption'>Version: <b>{props.service?.containerVersion}</b></Typography><br/>
                    </React.Fragment>
                }>
                <Chip
                    key={props.service?.containerVersion}
                    label={props.service?.containerVersion}
                    size="small"
                    variant="outlined"
                    className={classes.badge}
                />
            </Tooltip>
    );
};