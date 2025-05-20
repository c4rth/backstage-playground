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
import { CompoundEntityRef, Entity, RELATION_OWNED_BY, stringifyEntityRef } from '@backstage/catalog-model';
import { Box } from '@material-ui/core';
import { useGetSystems } from '../../hooks';
import { SystemPlatformDisplayName } from './SystemPlatformDisplayName';
import { useMemo } from 'react';


type TableRow = {
    id: number,
    system: {
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
        field: 'system.name',
        highlight: true,
        defaultSort: 'asc',
        render: ({ system }) => (
            <Link to={system.name}>
                <SystemPlatformDisplayName
                    name={system.name}
                />
            </Link>
        ),
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
        render: ({ resolved }) => (
            <EntityRefLinks
                entityRefs={resolved.ownedByRelations}
                defaultKind="group"
            />
        ),
    },
];

export const SystemPlatformTable = () => {
    const { items, loading, error } = useGetSystems();
    const rows = useMemo(() => items?.map(toEntityRow) || [], [items]);
    const showPagination = rows.length > 20;

    if (error) return <ResponseErrorPanel error={error} />;

    return (
        <Table<TableRow>
            isLoading={loading}
            columns={columns}
            options={{
                search: true,
                padding: 'dense',
                paging: showPagination,
                pageSize: 20,
                showEmptyDataSourceMessage: !loading,
                draggable: false,    
                thirdSortClick: false,               
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    Systems ({items ? items.length : 0})
                </Box>
            }
            data={rows}
        />
    );
};


function toEntityRow(entity: Entity, idx: number): TableRow {
    const ownedByRelations = getEntityRelations(entity, RELATION_OWNED_BY);
    return {
        id: idx,
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