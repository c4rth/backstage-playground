import {
    ResponseErrorPanel,
    Table,
    TableColumn,
} from '@backstage/core-components';
import {
    getEntityRelations,
    humanizeEntityRef,
    EntityRefLinks,
} from '@backstage/plugin-catalog-react';
import { Entity, RELATION_OWNED_BY, stringifyEntityRef } from '@backstage/catalog-model';
import React from 'react';
import { Box } from '@material-ui/core';
import {
    API_PLATFORM_SERVICE_NAME_ANNOTATION,
    API_PLATFORM_SERVICE_VERSION_ANNOTATION,
} from '@internal/plugin-api-platform-common';
import { useGetServices } from '../../hooks';

const columns: TableColumn[] = [
    {
        title: 'Name',
        width: '25%',
        field: 'service.name'
    },
    {
        title: 'Version',
        width: '5%',
        field: 'service.version'
    },
    {
        title: 'TST',
        field: 'service.environment',
        width: '10%',
    },
    {
        title: 'GTU',
        field: 'service.environment',
        width: '10%',
    },
    {
        title: 'UAT',
        field: 'service.environment',
        width: '10%',
    },
    {
        title: 'PTP',
        field: 'service.environment',
        width: '10%',
    },
    {
        title: 'PRD',
        field: 'service.environment',
        width: '10%',
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

export const ServiceTable = () => {
    const { items, loading, error } = useGetServices();
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
                paging: true,
                pageSize: 15,
                showEmptyDataSourceMessage: !loading,
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    Services ({items ? items.length : 0})
                </Box>
            }
            data={rows ?? []}
        />
    );
};


function toEntityRow(entity: Entity) {
    const ownedByRelations = getEntityRelations(entity, RELATION_OWNED_BY);
    return {
        entity,
        service: {
            name: entity.metadata[API_PLATFORM_SERVICE_NAME_ANNOTATION],
            description: entity.metadata.description || '',
            environment: entity.spec?.lifecycle,
            version: entity.metadata[API_PLATFORM_SERVICE_VERSION_ANNOTATION],
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