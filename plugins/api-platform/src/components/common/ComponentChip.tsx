import { ServiceEnvironmentDefinition } from '@internal/plugin-api-platform-common';
import { Link } from '@backstage/core-components';
import { RiCloudFill, RiGlobalLine, RiHomeOfficeLine } from '@remixicon/react';
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

const alphaToHex = (alpha: number): string => {
    const alphaInt = Math.round(alpha * 255);
    const hex = alphaInt.toString(16).padStart(2, '0').toUpperCase();
    return hex;
}

const applyAlpha = (color: string, alpha: number): string => {
    return `${color}${alphaToHex(alpha)}`;
};

const backgroundColors = [
    'var(--belui-chip-bg-color1)',
    'var(--belui-chip-bg-color2)',
    'var(--belui-chip-bg-color3)',
    'var(--belui-chip-bg-color4)',
    'var(--belui-chip-bg-color5)',
    'var(--belui-chip-bg-color6)',
    'var(--belui-chip-bg-color7)',
    'var(--belui-chip-bg-color8)',
    'var(--belui-chip-bg-color9)',
    'var(--belui-chip-bg-color10)',
];

const textColors = [
    'var(--belui-chip-fg-color1)',
    'var(--belui-chip-fg-color2)',
    'var(--belui-chip-fg-color3)',
    'var(--belui-chip-fg-color4)',
    'var(--belui-chip-fg-color5)',
    'var(--belui-chip-fg-color6)',
    'var(--belui-chip-fg-color7)',
    'var(--belui-chip-fg-color8)',
    'var(--belui-chip-fg-color9)',
    'var(--belui-chip-fg-color10)',
];

const getChipStyles = (index: number, backgroundColor: string | undefined) => {
    if (backgroundColor) {
        const alphaValue = Math.min(Math.max((index + 1) / 10, 0.1), 1);
        const textColor = alphaValue <= 0.5
            ? 'var(--bui-fg-primary)'
            : 'var(--bui-bg)';
        return {
            backgroundColor: applyAlpha(backgroundColor, alphaValue),
            color: textColor,
        };
    } else {
        return {
            backgroundColor: backgroundColors[index % backgroundColors.length],
            color: textColors[index % textColors.length], // 'var(--bui-fg-primary)'
        };;
    }
};

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

export const ComponentChip = ({
    index,
    icon,
    text,
    link,
    service,
    disabled = false,
    clickable = true,
    backgroundColor,
}: ComponentChipProps) => {
    const chipStyles = getChipStyles(index, backgroundColor);

    const platformIcon = getPlatformIcon(service?.platform);
    const chipLabel = text || service?.imageVersion || '?';
    const chipIcon = text ? icon : platformIcon;

    const tooltipContent = service ? (
        <>
            <Text>Platform: <b>{service.platform}</b></Text>
            <br />
            <Text>Version: <b>{service.imageVersion}</b></Text>
            <br />
            {service.dependencies && service.dependencies.length > 0 && (
                <>
                    <Text>Dependencies:</Text>
                    <Flex direction="column" gap="spacing-1">
                        {service.dependencies.map((dep) => (
                            <Text key={dep}>
                                <Text truncate>- <b>{dep}</b></Text>
                            </Text>
                        ))}
                    </Flex>
                </>
            )}
        </>
    ) : null;

    const chip = (
        <Chip
            label={chipLabel}
            size="small"
            variant="outlined"
            clickable={clickable}
            disabled={disabled}
            icon={chipIcon}
            style={{
                padding: tooltipContent ? 5 : 0,
                margin: 0,
                ...chipStyles,
            }}
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
            <Link to={link} style={{ padding: 0, margin: 0 }}>
                {content}
            </Link>
        ) : content
    );
};