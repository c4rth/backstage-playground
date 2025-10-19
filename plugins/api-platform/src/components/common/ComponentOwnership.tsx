import { Tag, TagGroup } from '@backstage/ui';
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
        <TagGroup
            selectionMode='single'
            selectedKeys={[selectedType]}
            onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] ?? 'all';
                handleSelectChange(selected.toString());
            }}>
            <Tag size="medium" id='all'>
                All
            </Tag>
            <Tag size="medium" id='owned'>
                Owned
            </Tag>
        </TagGroup>

    );

}