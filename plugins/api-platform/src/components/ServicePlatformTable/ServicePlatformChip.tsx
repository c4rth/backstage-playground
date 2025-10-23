import { memo, useMemo } from 'react';
import { ServiceEnvironmentDefinition } from '@internal/plugin-api-platform-common';
import { Link } from '@backstage/core-components';
import { RiCloudFill, RiGlobalLine, RiHomeOfficeLine } from '@remixicon/react';
import { Tooltip, Chip } from '@material-ui/core';
import { alpha, makeStyles, Theme } from '@material-ui/core/styles';

export type ServicePlatformChipProps = {
    index: number;
    icon?: React.JSX.Element;
    text?: string;
    link: string;
    service?: ServiceEnvironmentDefinition;
    disabled?: boolean;
};

const useStyles = makeStyles<Theme, { index: number }>(
    (theme: Theme) => ({
        badge: {
            backgroundColor: (props) =>
                alpha(theme.palette.primary.light, (props.index + 1) / 10),
        },
        chipContainer: {
            padding: 0,
            margin: 0,
        },
    }),
);

const PLATFORM_ICONS = {
    all: <RiGlobalLine />,
    onprem: <RiHomeOfficeLine />,
    cloud: <RiCloudFill />,
} as const;

const getPlatformIcon = (platform?: string): React.JSX.Element => {
    if (!platform) return PLATFORM_ICONS.cloud;
    
    const hasCloud = platform.includes('cloud');
    const hasOnprem = platform.includes('onprem');

    if (hasCloud && hasOnprem) return PLATFORM_ICONS.all;
    if (hasOnprem) return PLATFORM_ICONS.onprem;
    return PLATFORM_ICONS.cloud;
};

export const ServicePlatformChip = memo<ServicePlatformChipProps>(({
    index,
    icon,
    text,
    link,
    service,
    disabled = false,
}) => {
    const classes = useStyles({ index });

    const { chipIcon, chipLabel, tooltipContent } = useMemo(() => {
        const platformIcon = getPlatformIcon(service?.platform);
        const label = text || service?.imageVersion || '?';
        const chipIconValue = text ? icon : platformIcon;
        
        const tooltip = service ? (
            <h3>
                Platform: <b>{service.platform}</b>
                <br />
                Version: <b>{service.imageVersion}</b>
            </h3>
        ) : null;

        return {
            chipIcon: chipIconValue,
            chipLabel: label,
            tooltipContent: tooltip,
        };
    }, [service, text, icon]);

    const chip = (
        <Chip
            label={chipLabel}
            size="small"
            variant="outlined"
            className={classes.badge}
            clickable={!disabled}
            disabled={disabled}
            icon={chipIcon}
            style={{ padding: tooltipContent ? 5 : 0, margin: 0 }}
        />
    );

    const content = tooltipContent ? (
        <Tooltip placement="bottom" arrow title={tooltipContent}>
            {chip}
        </Tooltip>
    ) : chip;

    return (
        <Link to={link} className={classes.chipContainer}>
            {content}
        </Link>
    );
});