import {
    Link,
    ResponseErrorPanel,
    Table,
    TableColumn,
} from '@backstage/core-components';
import {
    EntityRefLinks,
    getEntityRelations,
    humanizeEntityRef,
} from '@backstage/plugin-catalog-react';
import { Entity, RELATION_OWNED_BY, stringifyEntityRef } from '@backstage/catalog-model';
import React from 'react';
import { Box } from '@material-ui/core';
import { useGetSystems } from '../../hooks';
import { SystemPlatformDisplayName } from './SystemPlatformDisplayName';


const columns: TableColumn[] = [
    {
        title: 'Name',
        width: '25%',
        field: 'system.name',
        highlight: true,
        render: ({ system }: any) => {
            return (
                <Link to={system.name}>
                    <SystemPlatformDisplayName
                        name={system.name}
                    />
                </Link>
            );
        },
    },
    {
        title: 'Description',
        width: '50%',
        field: 'description',
    },
    {
        title: 'Owner',
        width: '25%',
        field: 'resolved.ownedByRelationsTitle',
        render: ({ resolved }: any) => (
            <EntityRefLinks
                entityRefs={resolved.ownedByRelations}
                defaultKind="group"
            />
        ),
    },
];

export const SystemPlatformTable = () => {
    const { items, loading, error } = useGetSystems();
    if (error) {
        return <ResponseErrorPanel error={error} />;
    }

    const rows = items?.map(toEntityRow);

    return (
        <Table
            isLoading={loading}
            columns={columns}
            options={{
                search: true,
                padding: 'dense',
                paging: true,
                pageSize: 15,
                showEmptyDataSourceMessage: !loading,
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    Teams ({items ? items.length : 0})
                </Box>
            }
            data={rows ?? []}
        />
    );
};


function toEntityRow(entity: Entity) {
    const ownedByRelations = getEntityRelations(entity, RELATION_OWNED_BY);
    return {
        system: {
            name: entity.metadata.name?.toString() || '?',
            description: entity.metadata.description || '',
        },
        resolved: {
            entityRef: stringifyEntityRef(entity),
            ownedByRelationsTitle: ownedByRelations
                .map(r => humanizeEntityRef(r, { defaultKind: 'group' }))
                .join(', '),
            ownedByRelations,
        },
    };
}