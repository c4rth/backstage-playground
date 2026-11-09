import { HealthV1Probe } from '../../types';
import { Box, Cell } from '@backstage/ui';
import { Button as AriaButton } from 'react-aria-components';
import styles from './HealthDashboardV1Page.module.css';

const centerStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
} as const;
const bulletStyle = (color: string) =>
  ({
    borderRadius: '50%',
    width: '1em',
    height: '1em',
    backgroundColor: color,
  }) as const;

export const STATUS_COLORS: Record<number, { color: string; label: string }> = {
  200: { color: '#4caf50', label: 'OK' },
  202: { color: '#2196f3', label: 'XXX' },
  404: { color: '#9e9e9e', label: 'Not Found' },
  503: { color: '#ffc107', label: 'Unavailable' },
};
export const OTHER_STATUS_COLOR = { color: '#f44336', label: 'Error' };

const getBulletColor = (status: number): string =>
  STATUS_COLORS[status]?.color ?? OTHER_STATUS_COLOR.color;

export const HealthProbeCell = ({
  healthProbe,
  application,
  environment,
  onSelect,
}: {
  healthProbe: HealthV1Probe | undefined;
  application: string;
  environment: string;
  onSelect: (probe: HealthV1Probe) => void;
}) => {
  if (!healthProbe || !healthProbe.returnedHttpStatus) {
    return (
      <Cell>
        <Box style={centerStyle}>-</Box>
      </Cell>
    );
  }

  const bulletColor = getBulletColor(healthProbe.returnedHttpStatus);

  return (
    <Cell>
      <Box style={centerStyle}>
        <AriaButton
          className={styles.statusButton}
          aria-label={`Show ${environment.toUpperCase()} health details for ${application}`}
          onPress={() => onSelect(healthProbe)}
        >
          <span
            aria-hidden="true"
            style={bulletStyle(bulletColor)}
          />
        </AriaButton>
      </Box>
    </Cell>
  );
};
