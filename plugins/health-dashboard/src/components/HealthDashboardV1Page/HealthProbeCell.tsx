import { HealthV1Probe } from '../../types';
import { Box, Cell, Button } from '@backstage/ui';
import styles from '../common/HealthDashboard.module.css';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { healthDashboardTranslationRef } from '../../translation';

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

export const STATUS_COLORS: Record<number, { color: string }> = {
  200: { color: '#4caf50' },
  202: { color: '#2196f3' },
  404: { color: '#9e9e9e' },
  503: { color: '#ffc107' },
};
export const OTHER_STATUS_COLOR = { color: '#f44336' };

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
  const { t } = useTranslationRef(healthDashboardTranslationRef);
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
        <Button
          className={styles.statusButton}
          aria-label={t('dashboardV1Page.details.showHealth', {
            environment: environment.toUpperCase(),
            application,
          })}
          onPress={() => onSelect(healthProbe)}
        >
          <span
            aria-hidden="true"
            style={bulletStyle(bulletColor)}
          />
        </Button>
      </Box>
    </Cell>
  );
};
