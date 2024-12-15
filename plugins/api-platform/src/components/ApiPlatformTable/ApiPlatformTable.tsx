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
import * as yaml from 'js-yaml';
import { ApiDisplayName } from './ApiDisplayName';

const columns: TableColumn[] = [
    {
        title: 'Name',
        width: '20%',
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
        title: 'Title',
        field: 'api.title',
        width: '25%',
    },
    {
        title: 'Description',
        width: '40%',
        render: ({api} : any) => {
           return(
                <OverflowTooltip text={api.description} line={2} />
           )
        },
    },
    {
        title: 'Owner',
        width: '15%',
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
    const openApi: any = yaml.load(entity.spec?.definition?.toString() ?? '');
    const description: string = openApi?.info?.description || '';
    return {
        entity,
        api: {
            name: entity.metadata[API_PLATFORM_API_NAME_ANNOTATION],
            project: entity.metadata[API_PLATFORM_API_PROJECT_ANNOTATION],
            version: entity.metadata[API_PLATFORM_API_VERSION_ANNOTATION],
            title: openApi?.info?.title || '',
            // description: description.length > 512 ? `${description.slice(0, 512)}...` : description
            description: description
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