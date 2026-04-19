import { Box } from '@backstage/ui';
import { Chip } from '@internal/plugin-api-platform-react';
import { useState } from 'react';

export type DependentsType = 'all' | 'yes' | 'no';

interface DependentsToggleProps {
  handleDependentChange: (selected: DependentsType) => void;
}

const chipStyle = { marginTop: '6px', cursor: 'pointer', marginRight: '8px' };

export const DependentsToggle = ({
  handleDependentChange,
}: DependentsToggleProps) => {
  const [selectedType, setSelectedType] = useState<DependentsType>('all');

  const handleSelectChange = (type: DependentsType) => {
    setSelectedType(type);
    handleDependentChange(type);
  };

  return (
    <Box display="flex">
      <Chip
        label="All services"
        color={selectedType === 'all' ? 'primary' : 'default'}
        style={chipStyle}
        onClick={() => handleSelectChange('all')}
      />
      <Chip
        label="Dependents"
        color={selectedType === 'yes' ? 'primary' : 'default'}
        style={chipStyle}
        onClick={() => handleSelectChange('yes')}
      />
      <Chip
        label="Non-dependents"
        color={selectedType === 'no' ? 'primary' : 'default'}
        style={chipStyle}
        onClick={() => handleSelectChange('no')}
      />
    </Box>
  );
};
