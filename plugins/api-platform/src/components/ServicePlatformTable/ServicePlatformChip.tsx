import { ReactElement } from 'react';
import { Chip, Tooltip, Typography } from '@material-ui/core';
import { alpha, makeStyles, Theme } from '@material-ui/core/styles';
import { ServiceEnvironmentDefinition } from '@internal/plugin-api-platform-common';
import { Link } from '@backstage/core-components';
import PlatformAllIcon from '../icons/PlatformAllIcon';
import PlatformOnpremIcon from '../icons/PlatformOnpremIcon';
import PlatformCloudIcon from '../icons/PlatformCloudIcon';

export type ServicePlatformChipProps = {
    index: number;
    icon?: JSX.Element;
    text?: string;
    link: string;
    service?: ServiceEnvironmentDefinition;
    disabled?: boolean;
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

    const handleClick = () => () => {};

    // Icon selection logic
    const getPlatformIcon = () => {
        if (props.service?.platform?.includes('cloud') && props.service?.platform?.includes('onprem')) {
            return <PlatformAllIcon />;
        }
        if (props.service?.platform?.includes('onprem')) {
            return <PlatformOnpremIcon />;
        }
        return <PlatformCloudIcon />;
    };

    // Render a Chip inside a Link, optionally with Tooltip
    const renderChip = (label: string, iconEl: ReactElement | undefined, tooltip?: ReactElement) => {
        const chip = (
            <Chip
                key={label}
                label={label}
                size="small"
                variant="outlined"
                className={classes.badge}
                clickable={!props.disabled}
                disabled={props.disabled}
                onClick={handleClick}
                icon={iconEl}
                style={{ padding: tooltip ? '5px' : '0px', margin: '0px' }}
            />
        );
        return (
            <Link to={props.link} style={{ padding: '0px', margin: '0px' }}>
                {tooltip ? <Tooltip placement='bottom' arrow title={tooltip}>{chip}</Tooltip> : chip}
            </Link>
        );
    };

    if (props.text) {
        return renderChip(props.text, props.icon);
    }

    // Tooltip content for service chips
    const tooltipContent = (
        <>
            <Typography variant='caption'>Platform: <b>{props.service?.platform}</b></Typography><br />
            <Typography variant='caption'>Version: <b>{props.service?.imageVersion}</b></Typography><br />
        </>
    );
    return renderChip(props.service?.imageVersion || '?', getPlatformIcon(), tooltipContent);
};
