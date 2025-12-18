import { Box } from '@backstage/ui';
import { OwnershipType } from '@internal/plugin-api-platform-common';
import { Chip } from '@internal/plugin-api-platform-react';
import { useState } from 'react';

interface ComponentOwnershipProps {
  storageKey: string;
  handleOwnershipChange: (selected: OwnershipType) => void;
}

const chipStyle = { marginTop: '6px', cursor: 'pointer', marginRight: '8px' };

export const ComponentOwnership = ({ storageKey, handleOwnershipChange }: ComponentOwnershipProps) => {
  const [selectedType, setSelectedType] = useState<OwnershipType>(
    () => (sessionStorage.getItem(storageKey) === 'owned' ? 'owned' : 'all')
  );

  const handleSelectChange = (type: OwnershipType) => {
    sessionStorage.setItem(storageKey, type);
    setSelectedType(type);
    handleOwnershipChange(type);
  };

  return (
    <Box display='flex'>
      <Chip
        label="Owned"
        color={selectedType === 'owned' ? 'primary' : 'default'}
        style={chipStyle}
        onClick={() => handleSelectChange('owned')}
      />
      <Chip
        label="All"
        color={selectedType === 'all' ? 'primary' : 'default'}
        style={chipStyle}
        onClick={() => handleSelectChange('all')}
      />
    </Box>
  );
};