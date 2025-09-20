import { OwnershipType } from '@internal/plugin-api-platform-common';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { useCallback, useState } from 'react';


interface ComponentOwnershipProps {
    storageKey: string;
    suffix?: string;
    handleOwnershipChange: (selected: OwnershipType) => void;
}

export const ComponentOwnership = ({ storageKey, suffix, handleOwnershipChange }: ComponentOwnershipProps) => {

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
        <ToggleButtonGroup color='secondary' exclusive value={selectedType} onChange={(_, value) => handleSelectChange(value ?? 'all')}>
            <ToggleButton value="all">All {suffix}</ToggleButton>
            <ToggleButton value="owned">Owned {suffix}</ToggleButton>
        </ToggleButtonGroup>
    );

}