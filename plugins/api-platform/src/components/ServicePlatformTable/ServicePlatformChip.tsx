import { memo, useCallback, useMemo } from 'react';
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
            backgroundColor: (props: ServicePlatformChipProps) => 
                alpha(theme.palette.primary.light, (props.index + 1) / 10),
        },
        chipContainer: {
            padding: '0px',
            margin: '0px',
        },
    }),
);

const PlatformIcons = {
    all: <PlatformAllIcon />,
    onprem: <PlatformOnpremIcon />,
    cloud: <PlatformCloudIcon />,
} as const;

export const ServicePlatformChip = memo<ServicePlatformChipProps>((props) => {
    const classes = useStyles(props);

    // Memoize platform icon selection
    const platformIcon = useMemo(() => {
        if (!props.service?.platform) return PlatformIcons.cloud;
        
        const platform = props.service.platform;
        const hasCloud = platform.includes('cloud');
        const hasOnprem = platform.includes('onprem');
        
        if (hasCloud && hasOnprem) return PlatformIcons.all;
        if (hasOnprem) return PlatformIcons.onprem;
        return PlatformIcons.cloud;
    }, [props.service?.platform]);

    // Memoize tooltip content
    const tooltipContent = useMemo(() => {
        if (!props.service) return null;
        
        return (
            <>
                <Typography variant='caption'>
                    Platform: <b>{props.service.platform}</b>
                </Typography>
                <br />
                <Typography variant='caption'>
                    Version: <b>{props.service.imageVersion}</b>
                </Typography>
                <br />
            </>
        );
    }, [props.service]);

    // Memoize chip styles
    const chipStyle = useMemo(() => ({
        padding: tooltipContent ? '5px' : '0px',
        margin: '0px',
    }), [tooltipContent]);

    // Optimize click handler (remove unused functionality)
    const handleClick = useCallback(() => {
        // Add actual click logic here if needed
    }, []);

    // Memoize chip component
    const chipComponent = useMemo(() => {
        const label = props.text || props.service?.imageVersion || '?';
        const icon = props.text ? props.icon : platformIcon;
        
        return (
            <Chip
                key={label}
                label={label}
                size="small"
                variant="outlined"
                className={classes.badge}
                clickable={!props.disabled}
                disabled={props.disabled}
                onClick={handleClick}
                icon={icon}
                style={chipStyle}
            />
        );
    }, [
        props.text,
        props.service?.imageVersion,
        props.icon,
        platformIcon,
        classes.badge,
        props.disabled,
        handleClick,
        chipStyle,
    ]);

    // Memoize final component
    const finalComponent = useMemo(() => {
        if (tooltipContent) {
            return (
                <Tooltip placement='bottom' arrow title={tooltipContent}>
                    {chipComponent}
                </Tooltip>
            );
        }
        return chipComponent;
    }, [tooltipContent, chipComponent]);

    return (
        <Link to={props.link} className={classes.chipContainer}>
            {finalComponent}
        </Link>
    );
});