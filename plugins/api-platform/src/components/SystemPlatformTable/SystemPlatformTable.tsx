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
import { useGetAllSystems, useGetSystemsOwnedByUser } from '../../hooks';
import { SystemPlatformDisplayName } from './SystemPlatformDisplayName';
import { useCallback, useMemo } from 'react';


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

const STABLE_COLUMNS: TableColumn<TableRow>[] = [
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

const DEFAULT_PAGE_SIZE = 20;

interface BaseSystemTableProps {
    title: string;
    items?: Entity[];
    loading: boolean;
    error?: Error;
}

const BaseSystemTable = ({ title, items, loading, error }: BaseSystemTableProps) => {
    const initialSearch = sessionStorage.getItem('systemsPlatformTableSearch') || '';
    const rows = useMemo(() => items?.map(toEntityRow) || [], [items]);
    const showPagination = rows.length > DEFAULT_PAGE_SIZE;
    const itemCount = items?.length || 0;

    const handleSearchChange = useCallback((search: string) => {
        sessionStorage.setItem('systemsPlatformTableSearch', search);
    }, []);

    const tableTitle = useMemo(() => (
        <Box display="flex" alignItems="center">
            <Box mr={1} />
            {title} ({itemCount})
        </Box>
    ), [title, itemCount]);

    if (error) {
        return <ResponseErrorPanel error={error} />;
    }

    return (
        <Table<TableRow>
            isLoading={loading}
            columns={STABLE_COLUMNS}
            options={{
                search: true,
                padding: 'dense' as const,
                paging: showPagination,
                pageSize: DEFAULT_PAGE_SIZE,
                showEmptyDataSourceMessage: !loading,
                draggable: false,
                thirdSortClick: false,
                searchText: initialSearch,
            }}
            title={tableTitle}
            onSearchChange={handleSearchChange}
            data={rows}
        />
    );
};

export const OwnedSystemPlatformTable = () => {
    const { items, loading, error } = useGetSystemsOwnedByUser();

    return (
        <BaseSystemTable
            title="Owned Systems"
            items={items}
            loading={loading}
            error={error}
        />
    );
};

export const SystemPlatformTable = () => {
    const { items, loading, error } = useGetAllSystems();

    return (
        <BaseSystemTable
            title="Systems"
            items={items}
            loading={loading}
            error={error}
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