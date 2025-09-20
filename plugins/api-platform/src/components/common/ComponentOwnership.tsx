import {
    SelectItem,
    Select,
} from '@backstage/core-components';
import { OwnershipType } from '@internal/plugin-api-platform-common';
import { useCallback, useMemo, useState } from 'react';


interface ComponentOwnershipProps {
    storageKey: string;
    suffix: string;
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

    const items = useMemo<SelectItem[]>(
        () => [
            { label: `All ${suffix}`, value: 'all' },
            { label: `Owned ${suffix}`, value: 'owned' },
        ],
        [suffix]
    );

    return (
        <Select
            onChange={selected => handleSelectChange(selected.toString())}
            label="Ownership"
            items={items}
            selected={selectedType}
        />
    );

}