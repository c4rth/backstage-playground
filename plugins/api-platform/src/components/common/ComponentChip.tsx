import { ServiceEnvironmentDefinition } from '@internal/plugin-api-platform-common';
import { Link } from '@backstage/core-components';
import { RiCloudFill, RiGlobalLine, RiHomeOfficeLine } from '@remixicon/react';
import { Chip } from '@internal/plugin-api-platform-react';
import { Text, TooltipTrigger, Tooltip, Flex, Box } from '@backstage/ui';

export type ComponentChipProps = {
  index?: number;
  text?: string;
  link?: string;
  service?: ServiceEnvironmentDefinition;
  backgroundColor?: string;
};

const alphaToHex = (alpha: number): string => {
  const alphaInt = Math.round(alpha * 255);
  const hex = alphaInt.toString(16).padStart(2, '0').toUpperCase();
  return hex;
};

const applyAlpha = (color: string, alpha: number): string => {
  return `${color}${alphaToHex(alpha)}`;
};

const backgroundColors = [
  'var(--belui-chip-bg-color1)',
  'var(--belui-chip-bg-color2)',
  'var(--belui-chip-bg-color3)',
  'var(--belui-chip-bg-color4)',
  'var(--belui-chip-bg-color5)',
];

const getContrastColor = (hexColor: string, alpha: number = 1) => {
    const cleanHex = hexColor.replace('#', '');
    const rSrc = parseInt(cleanHex.slice(0, 2), 16);
    const gSrc = parseInt(cleanHex.slice(2, 4), 16);
    const bSrc = parseInt(cleanHex.slice(4, 6), 16);

    // Blend with white background (255)
    const r = Math.round(rSrc * alpha + 255 * (1 - alpha));
    const g = Math.round(gSrc * alpha + 255 * (1 - alpha));
    const b = Math.round(bSrc * alpha + 255 * (1 - alpha));

    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? 'var(--bui-fg-primary)' : 'var(--bui-fg-solid-disabled)';
  };

const getChipStyles = (index: number | undefined, backgroundColor: string) => {
  if (backgroundColor === 'auto') {
    const idx = index! % backgroundColors.length;
    return {
      backgroundColor: backgroundColors[idx],
      color: 'var(--bui-black)',
    };
  }
  if (index === undefined) {
    return {
      backgroundColor: backgroundColor,
      color: getContrastColor(backgroundColor),
    };
  }
  const alphaValue = Math.min(Math.max((index + 1) / 10, 0.1), 1);
  return {
    backgroundColor: applyAlpha(backgroundColor, alphaValue),
    color: getContrastColor(backgroundColor, alphaValue),
  };
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
  text,
  link,
  service,
  backgroundColor = 'auto',
}: ComponentChipProps) => {
  const chipStyles = getChipStyles(index, backgroundColor);

  const platformIcon = getPlatformIcon(service?.platform);
  const chipLabel = text || service?.imageVersion || '?';
  const chipIcon = text ? undefined : platformIcon;

  const tooltipContent = service ? (
    <Box>
      <Text>
        Platform: <b>{service.platform}</b>
      </Text>
      <br />
      <Text>
        Version: <b>{service.imageVersion}</b>
      </Text>
      <br />
      {service.dependencies && service.dependencies.length > 0 && (
        <>
          <Text>Dependencies:</Text>
          <Flex direction="column" gap="spacing-1">
            {service.dependencies.map(dep => (
              <Text key={dep}>
                <Text>
                  - <b>{dep}</b>
                </Text>
              </Text>
            ))}
          </Flex>
        </>
      )}
    </Box>
  ) : null;

  const clickable = !!link;

  const chip = (
    <Chip
      label={chipLabel}
      size="small"
      variant="outlined"
      clickable={clickable}
      icon={chipIcon}
      style={{
        padding: tooltipContent ? 5 : 0,
        margin: 0,
        ...chipStyles,
      }}
    />
  );

  const content = tooltipContent ? (
    <TooltipTrigger trigger="hover" delay={500}>
      {chip}
      <Tooltip placement="bottom" style={{ maxWidth: '50rem' }}>
        {tooltipContent}
      </Tooltip>
    </TooltipTrigger>
  ) : (
    chip
  );

  return link ? (
    <Link to={link} style={{ padding: 0, margin: 0 }}>
      {content}
    </Link>
  ) : (
    content
  );
};
