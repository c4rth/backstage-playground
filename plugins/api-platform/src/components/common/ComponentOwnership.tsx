import { Box } from '@backstage/ui';
import { OwnershipType } from '@internal/plugin-api-platform-common';
import { Chip, useStoredValue } from '@internal/plugin-components-react';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { apiPlatformTranslationRef } from '../../translation';

interface ComponentOwnershipProps {
  storageKey: string;
  handleOwnershipChange: (selected: OwnershipType) => void;
}

const chipStyle = { cursor: 'pointer', marginRight: '8px' };

export const ComponentOwnership = ({
  storageKey,
  handleOwnershipChange,
}: ComponentOwnershipProps) => {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
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
        label={t('ownership.all')}
        chipColor={selectedType === 'all' ? 'primary' : 'outlined'}
        style={chipStyle}
        clickable
        onClick={() => handleSelectChange('all')}
      />
      <Chip
        label={t('ownership.owned')}
        chipColor={selectedType === 'owned' ? 'primary' : 'outlined'}
        style={chipStyle}
        clickable
        onClick={() => handleSelectChange('owned')}
      />
    </Box>
  );
};
