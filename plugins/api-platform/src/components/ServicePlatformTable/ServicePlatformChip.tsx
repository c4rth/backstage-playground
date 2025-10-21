import { memo, useCallback, useMemo } from 'react';
import { ServiceEnvironmentDefinition } from '@internal/plugin-api-platform-common';
import { Link } from '@backstage/core-components';
import { RiCloudLine, RiGlobalLine, RiHomeOfficeLine } from '@remixicon/react';
import { Text } from '@backstage/ui';

import { Chip } from '@internal/plugin-api-platform-react';

// TODO-MUI 
import { Tooltip } from '@material-ui/core';
import { alpha, makeStyles, Theme } from '@material-ui/core/styles';

export type ServicePlatformChipProps = {
    index: number;
    icon?: React.JSX.Element;
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
    all: <RiGlobalLine />,
    onprem: <RiHomeOfficeLine />,
    cloud: <RiCloudLine />,
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
                <Text variant='body-small' color="secondary">
                    Platform: <b>{props.service.platform}</b>
                </Text>
                <br />
                <Text variant='body-small' color="secondary">
                    Version: <b>{props.service.imageVersion}</b>
                </Text>
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
        const color = alpha('#C30045', (props.index + 1) / 10);

/*

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
            */

        return (
            <Chip head={false} backgroundColor={color}>
                {icon} <span style={{ marginLeft: '4px' }}><Text variant='body-x-small'>{label}</Text></span>
            </Chip>
        );
    }, [
        props.text,
        props.service,
        props.index,
        props.disabled,
        platformIcon,
        handleClick,
        classes.badge,
        chipStyle,
    ]);

    // Memoize final component
    const finalComponent = useMemo(() => {
        if (tooltipContent) {
            return (
                <Tooltip placement='bottom' arrow title={tooltipContent} style={{ backgroundColor: '#FF0000' }}>
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