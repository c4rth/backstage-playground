import { Box } from '@backstage/ui';
import { DependentsType } from '@internal/plugin-api-platform-common';
import { Chip } from '@internal/plugin-components-react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { apiPlatformTranslationRef } from '../../translation';

interface DependentsToggleProps {
  handleDependentChange: (selected: DependentsType) => void;
  selectedType: DependentsType;
}

const chipStyle = { cursor: 'pointer', marginRight: '8px' };

export const DependentsToggle = ({
  handleDependentChange,
  selectedType = 'all',
}: DependentsToggleProps) => {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  const handleSelectChange = (type: DependentsType) => {
    handleDependentChange(type);
  };

  return (
    <Box display="flex">
      <Chip
        label={t('dependents.all')}
        chipColor={selectedType === 'all' ? 'primary' : 'outlined'}
        clickable
        style={chipStyle}
        onClick={() => handleSelectChange('all')}
      />
      <Chip
        label={t('dependents.yes')}
        chipColor={selectedType === 'yes' ? 'primary' : 'outlined'}
        style={chipStyle}
        clickable
        onClick={() => handleSelectChange('yes')}
      />
      <Chip
        label={t('dependents.no')}
        chipColor={selectedType === 'no' ? 'primary' : 'outlined'}
        clickable
        style={chipStyle}
        onClick={() => handleSelectChange('no')}
      />
    </Box>
  );
};
