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
import { useCallback, useMemo } from 'react';
import { ComponentDisplayName } from '../common';


type TableRow = {
    id: number,
    name: string,
    description: string,
    entityRef: string,
    ownedByRelationsTitle: string,
    ownedByRelations: CompoundEntityRef[],
}

const STABLE_COLUMNS: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '25%',
        field: 'name',
        highlight: true,
        defaultSort: 'asc',
        render: ({ name }: TableRow) => (
            <Link to={name}>
                <ComponentDisplayName text={name} type='system' />
            </Link>
        ),
    },
    {
        title: 'Description',
        width: '50%',
        field: 'description',
        render: ({ description }: TableRow) => description || '-',
    },
    {
        title: 'Owner',
        width: '25%',
        field: 'ownedByRelationsTitle',
        render: ({ ownedByRelations }: TableRow) => (
            <EntityRefLinks
                entityRefs={ownedByRelations}
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

const toEntityRow = (entity: Entity, idx: number): TableRow => {
    const ownedByRelations = getEntityRelations(entity, RELATION_OWNED_BY);
    return {
        id: idx,
        name: entity.metadata.name ?? '?',
        description: entity.metadata.description ?? '',
        entityRef: stringifyEntityRef(entity),
        ownedByRelationsTitle: ownedByRelations
            .map(r => humanizeEntityRef(r, { defaultKind: 'group' }))
            .join(', '),
        ownedByRelations,
    };
};

const BaseSystemTable = ({ title, items, loading, error }: BaseSystemTableProps) => {
    const initialSearch = sessionStorage.getItem('systemsPlatformTableSearch') || '';
    const rows = useMemo(() => items?.map(toEntityRow) ?? [], [items]);
    const showPagination = rows.length > DEFAULT_PAGE_SIZE;
    const itemCount = items?.length ?? 0;

    const handleSearchChange = useCallback((search: string) => {
        sessionStorage.setItem('systemsPlatformTableSearch', search);
    }, []);

    const tableOptions = useMemo(() => ({
        search: true,
        padding: 'dense' as const,
        paging: showPagination,
        pageSize: DEFAULT_PAGE_SIZE,
        showEmptyDataSourceMessage: !loading,
        draggable: false,
        thirdSortClick: false,
        searchText: initialSearch,
    }), [showPagination, loading, initialSearch]);

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
            options={tableOptions}
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