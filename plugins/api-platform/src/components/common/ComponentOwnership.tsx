import { Box } from '@backstage/ui';
import { Chip } from '@material-ui/core';
import { OwnershipType } from '@internal/plugin-api-platform-common';
import { useCallback, useState } from 'react';


interface ComponentOwnershipProps {
    storageKey: string;
    handleOwnershipChange: (selected: OwnershipType) => void;
}

export const ComponentOwnership = ({ storageKey, handleOwnershipChange }: ComponentOwnershipProps) => {

    const [selectedType, setSelectedType] = useState<OwnershipType>(
        () => (sessionStorage.getItem(storageKey) === 'owned' ? 'owned' : 'all')
    );

    const handleSelectChange = useCallback(
        (selected: string) => {
            const value = selected === 'owned' ? 'owned' : 'all';
            if (value !== selectedType) {
                sessionStorage.setItem(storageKey, value);
                setSelectedType(value);
                handleOwnershipChange(value as OwnershipType);
            }
        },
        [storageKey, handleOwnershipChange, selectedType]
    );

    return (
        <Box display='flex'>
            <Chip
                label="Owned"
                color={selectedType === 'owned' ? 'primary' : 'default'}
                style={{ marginRight: '8px', marginTop: '6px', cursor: 'pointer' }}
                onClick={() => handleSelectChange('owned')}
            />
            <Chip
                label="&nbsp;All"
                color={selectedType === 'all' ? 'primary' : 'default'}
                onClick={() => handleSelectChange('all')}
                style={{ marginTop: '6px', cursor: 'pointer' }}
            />
        </Box>

    );

}