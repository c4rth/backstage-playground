import { Box, Button, Select } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { RiRestartLine } from '@remixicon/react';
import { useEffect, useState } from 'react';
import { healthDashboardTranslationRef } from '../../translation';

type RefreshControlsProps = {
  onRefresh: () => void;
  isDisabled?: boolean;
};

export const RefreshControls = ({
  onRefresh,
  isDisabled,
}: RefreshControlsProps) => {
  const { t } = useTranslationRef(healthDashboardTranslationRef);
  const [refreshInterval, setRefreshInterval] = useState(0);
  const refreshIntervals = [
    { label: t('refreshControls.off'), id: '0' },
    { label: t('refreshControls.fiveSeconds'), id: '5000' },
    { label: t('refreshControls.tenSeconds'), id: '10000' },
    { label: t('refreshControls.thirtySeconds'), id: '30000' },
    { label: t('refreshControls.oneMinute'), id: '60000' },
    { label: t('refreshControls.fiveMinutes'), id: '300000' },
  ];

  useEffect(() => {
    if (refreshInterval <= 0) {
      return undefined;
    }

    const interval = setInterval(onRefresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, onRefresh]);

  return (
    <Box style={{ display: 'flex', alignItems: 'center' }}>
      <Button
        variant="secondary"
        onClick={() => onRefresh()}
        iconEnd={<RiRestartLine />}
        isDisabled={isDisabled}
      >
        {t('refreshControls.button')}
      </Button>
      <Select
        onChange={selected => {
          setRefreshInterval(parseInt(selected?.toString() ?? '0', 10));
        }}
        label=""
        options={refreshIntervals}
        value={refreshInterval.toString()}
        aria-label={t('refreshControls.intervalLabel')}
      />
    </Box>
  );
};
