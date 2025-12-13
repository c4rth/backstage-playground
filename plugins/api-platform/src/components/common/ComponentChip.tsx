import { memo, useMemo } from 'react';
import { ServiceEnvironmentDefinition } from '@internal/plugin-api-platform-common';
import { Link } from '@backstage/core-components';
import { RiCloudFill, RiGlobalLine, RiHomeOfficeLine } from '@remixicon/react';
import { alpha, makeStyles, Theme } from '@material-ui/core/styles';
import { Chip } from '@internal/plugin-api-platform-react';
import { Text, TooltipTrigger, Tooltip, Flex } from '@backstage/ui';

export type ComponentChipProps = {
    index: number;
    icon?: React.JSX.Element;
    text?: string;
    link?: string;
    service?: ServiceEnvironmentDefinition;
    disabled?: boolean;
    clickable?: boolean;
    backgroundColor?: string;
};

const useStyles = makeStyles<Theme, { index: number; backgroundColor?: string }>(
    (theme: Theme) => ({
        badge: {
            backgroundColor: (props) =>
                props.backgroundColor
                    ? alpha(props.backgroundColor, (props.index + 1) / 10)
                    : alpha(theme.palette.primary.light, (props.index + 1) / 10),
            color: (props) => {
                const alphaValue = (props.index + 1) / 10;                
                if (alphaValue <= 0.5) {
                    return theme.palette.text.primary;
                }                
                const baseColor = props.backgroundColor || theme.palette.primary.light;
                return theme.palette.getContrastText(baseColor);
            },
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

export const ComponentChip = memo<ComponentChipProps>(({
    index,
    icon,
    text,
    link,
    service,
    disabled = false,
    clickable = true,
    backgroundColor,
}) => {
    const classes = useStyles({ index, backgroundColor });

    const { chipIcon, chipLabel, tooltipContent } = useMemo(() => {
        const platformIcon = getPlatformIcon(service?.platform);
        const label = text || service?.imageVersion || '?';
        const chipIconValue = text ? icon : platformIcon;

        const tooltip = service ? (
            <>
                <Text>Platform: <b>{service.platform}</b></Text>
                <br />
                <Text>Version: <b>{service.imageVersion}</b></Text>
                <br />
                {service.dependencies && service.dependencies.length > 0 ?
                    (
                        <>
                            <Text>Dependencies:</Text>
                            <Flex direction="column" gap="spacing-1">
                                {service.dependencies.map((dep) => (
                                    <Text key={dep}>
                                        <Text>- <b>{dep}</b></Text>
                                    </Text>
                                ))}
                            </Flex>
                        </>
                    ) : null}
            </>
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
            clickable={clickable}
            disabled={disabled}
            icon={chipIcon}
            style={{ padding: tooltipContent ? 5 : 0, margin: 0 }}
        />
    );

    const content = tooltipContent ? (
        <TooltipTrigger trigger='hover' delay={250}>
            {chip}
            <Tooltip placement="bottom">
                {tooltipContent}
            </Tooltip>
        </TooltipTrigger>
    ) : chip;

    return (
        link ? (
            <Link to={link} className={classes.chipContainer}>
                {content}
            </Link>
        ) : content
    );
});