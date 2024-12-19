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
import { useGetApiDefinitions } from '../../hooks';
import { Box } from '@material-ui/core';
import {
    API_PLATFORM_API_NAME_ANNOTATION,
    API_PLATFORM_API_PROJECT_ANNOTATION,
    API_PLATFORM_API_VERSION_ANNOTATION
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
        render: ({api} : any) => {
           return(
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
    const { items, loading, error } = useGetApiDefinitions();
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
                    API ({items ? items.length : 0})
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
            project: entity.metadata[API_PLATFORM_API_PROJECT_ANNOTATION],
            version: entity.metadata[API_PLATFORM_API_VERSION_ANNOTATION],
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