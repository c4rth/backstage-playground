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
import { CompoundEntityRef, Entity, RELATION_OWNED_BY, stringifyEntityRef } from '@backstage/catalog-model';
import React from 'react';
import { useGetApis } from '../../hooks';
import { Box } from '@material-ui/core';
import {
    ANNOTATION_API_NAME,
} from '@internal/plugin-api-platform-common';
import { ApiPlatformDisplayName } from './ApiPlatformDisplayName';

type TableRow = {
    id: number,
    api: {
        name: string,
        description: string,
    },
    resolved: {
        entityRef: string,
        ownedByRelationsTitle: string,
        ownedByRelations: CompoundEntityRef[],
    },
}

const columns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '25%',
        field: 'api.name',
        highlight: true,
        render: ({ api }) => {
            return (
                <Link to={api.name}>
                    <ApiPlatformDisplayName
                        text={api.name}
                    />
                </Link>
            );
        },
    },
    {
        title: 'Description',
        field: 'api.description',
        width: '50%',
        render: ({ api }) => {
            return (
                <OverflowTooltip text={api.description} line={2} />
            )
        },
    },
    {
        title: 'Owner',
        width: '25%',
        field: 'resolved.ownedByRelationsTitle',
        render: ({ resolved }) => (
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
    const rows = items?.map(toEntityRow) || [];
    const showPagination = rows.length > 20;
    return (
        <Table<TableRow>
            isLoading={loading}
            columns={columns}
            options={{
                search: true,
                paging: showPagination,
                padding: 'dense',
                pageSize: 20,
                showEmptyDataSourceMessage: !loading,
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    APIs ({items ? items.length : 0})
                </Box>
            }
            data={rows}
        />
    );
};


function toEntityRow(entity: Entity, idx: number) {
    const ownedByRelations = getEntityRelations(entity, RELATION_OWNED_BY);
    return {
        id: idx,
        api: {
            name: entity.metadata[ANNOTATION_API_NAME]?.toString() || '?',
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