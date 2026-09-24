import { Box } from '@backstage/ui';
import { OwnershipType } from '@internal/plugin-api-platform-common';
import { Chip, useStoredValue } from '@internal/plugin-components-react';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';

interface ComponentOwnershipProps {
  storageKey: string;
  handleOwnershipChange: (selected: OwnershipType) => void;
}

const chipStyle = { cursor: 'pointer', marginRight: '8px' };

export const ComponentOwnership = ({
  storageKey,
  handleOwnershipChange,
}: ComponentOwnershipProps) => {
  const { initialValue: selectedType, storeValue: setSelectedType } =
    useStoredValue<OwnershipType>(storageKey, 'all');
  const identityApi = useApi(identityApiRef);

  const {
    value: isGuest,
    loading,
    error,
  } = useAsync(async () => {
    const userProfile = await identityApi.getProfileInfo();
    const backStageIdentity = await identityApi.getBackstageIdentity();
    return (
      backStageIdentity.userEntityRef === 'user:default/guest' ||
      !userProfile.email
    );
  }, [identityApi]);

  const handleSelectChange = (type: OwnershipType) => {
    setSelectedType(type);
    handleOwnershipChange(type);
  };

  if (loading || error || isGuest) {
    return null;
  }

  return (
    <Box display="flex">
      <Chip
        label="All"
        color={selectedType === 'all' ? 'primary' : 'default'}
        style={chipStyle}
        clickable
        onClick={() => handleSelectChange('all')}
      />
      <Chip
        label="Owned"
        color={selectedType === 'owned' ? 'primary' : 'default'}
        style={chipStyle}
        clickable
        onClick={() => handleSelectChange('owned')}
      />
    </Box>
  );
};
