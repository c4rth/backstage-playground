import {
    ResponseErrorPanel,
    Table,
    TableColumn,
    Link,
    OverflowTooltip,
} from '@backstage/core-components';
import {
    getEntityRelations,
    humanizeEntityRef,
    EntityRefLinks,
} from '@backstage/plugin-catalog-react';
import { Entity, RELATION_OWNED_BY, stringifyEntityRef } from '@backstage/catalog-model';
import React from 'react';
import { useGetApis } from '../../hooks';
import { Box } from '@material-ui/core';
import {
    API_PLATFORM_API_NAME_ANNOTATION,
} from '@internal/plugin-api-platform-common';
import { ApiDisplayName } from './ApiDisplayName';

const columns: TableColumn[] = [
    {
        title: 'Name',
        width: '25%',
        field: 'api.name',
        render: ({ entity, api }: any) => {
            return (
                <Link to={api.name}>
                    <ApiDisplayName
                        entityRef={entity}
                    />
                </Link>
            );
        },
    },
    {
        title: 'Description',
        field: 'api.description',
        width: '50%',
        render: ({ api }: any) => {
            return (
                <OverflowTooltip text={api.description} line={2} />
            )
        },
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


export const ApiPlatformTable = () => {
    const { items, loading, error } = useGetApis();
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
                padding: 'dense',
                pageSize: 15,
                showEmptyDataSourceMessage: !loading,
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    APIs ({items ? items.length : 0})
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
        api: {
            name: entity.metadata[API_PLATFORM_API_NAME_ANNOTATION],
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