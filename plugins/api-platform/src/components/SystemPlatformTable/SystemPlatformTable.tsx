import {
    Link,
    Progress,
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ComponentDisplayName } from '../common';
import { useApi } from '@backstage/core-plugin-api';
import { ApiPlatformBackendApi, apiPlatformBackendApiRef } from '../../api/ApiPlatformBackendApi';
import { Query } from '@material-table/core';
import { SystemDefinitionsListRequest, OwnershipType } from '@internal/plugin-api-platform-common';

type TableRow = {
    id: number,
    name: string,
    description: string,
    entityRef: string,
    owner: string,
    ownedByRelations: CompoundEntityRef[],
}

const columns: TableColumn<TableRow>[] = [
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
        field: 'owner',
        render: ({ ownedByRelations }: TableRow) => (
            <EntityRefLinks
                entityRefs={ownedByRelations}
                defaultKind="group"
            />
        ),
    },
];

const PAGE_SIZE = 20;

const toEntityRow = (entity: Entity, idx: number): TableRow => {
    const ownedByRelations = getEntityRelations(entity, RELATION_OWNED_BY);
    return {
        id: idx,
        name: entity.metadata.name ?? '?',
        description: entity.metadata.description ?? '',
        entityRef: stringifyEntityRef(entity),
        owner: ownedByRelations
            .map(r => humanizeEntityRef(r, { defaultKind: 'group' }))
            .join(', '),
        ownedByRelations,
    };
};

async function getData(apiPlatformApi: ApiPlatformBackendApi, ownership: OwnershipType, query: Query<TableRow>) {
    const page = query.page ?? 0;
    const pageSize = query.pageSize ?? PAGE_SIZE;
    const result = await apiPlatformApi.listSystems({
        offset: page * pageSize,
        limit: pageSize,
        search: query.search,
        orderBy: query.orderBy ? {
            field: query.orderBy.field,
            direction: query.orderDirection,
        } as SystemDefinitionsListRequest['orderBy'] : undefined,
        ownership: ownership,
    });
    if (result) {
        return {
            data: result.items.map(toEntityRow),
            totalCount: result.totalCount,
            page: Math.floor(result.offset / result.limit),
        };
    }
    return {
        data: [],
        totalCount: 0,
        page: 0,
    };
}

interface SystemPlatformTableProps {
    ownership: 'all' | 'owned';
}

export const SystemPlatformTable = ({ ownership }: SystemPlatformTableProps) => {
    const apiPlatformApi = useApi(apiPlatformBackendApiRef);
    const initialSearch = sessionStorage.getItem('systemsPlatformTableSearch') ?? '';
    const [countRows, setCountRows] = useState<number>(0);
    const [loadingCount, setLoadingCount] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const tableOptions = useMemo(() => ({
        search: true,
        padding: 'dense' as const,
        pageSize: PAGE_SIZE,
        pageSizeOptions: [10, PAGE_SIZE, 50],
        showEmptyDataSourceMessage: !loadingCount,
        draggable: false,
        thirdSortClick: false,
        searchText: initialSearch,
    }), [loadingCount, initialSearch]);

    const tableTitle = useMemo(() => (
        <Box display="flex" alignItems="center">
            <Box mr={1} />
            {ownership === 'owned' ? 'Owned' : 'All'} Systems ({countRows})
        </Box>
    ), [ownership, countRows]);

    useEffect(() => {
        const fetchCount = async () => {
            setLoadingCount(true);
            setError(null);
            try {
                const count = await apiPlatformApi.getSystemsCount(ownership);
                setCountRows(count);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoadingCount(false);
            }
        };
        fetchCount();
    }, [ownership, apiPlatformApi]);

    const fetchData = useCallback(
        async (query: Query<TableRow>) => {
            if (query.search !== undefined) {
                sessionStorage.setItem('systemsPlatformTableSearch', query.search);
            }
            return getData(apiPlatformApi, ownership, query);
        },
        [apiPlatformApi, ownership]
    );

    if (error) {
        return <ResponseErrorPanel error={error} />;
    }

    if (loadingCount) return <Progress />;
    if (error) return <ResponseErrorPanel error={error} />;

    return (
        <Table<TableRow>
            isLoading={loadingCount}
            columns={columns}
            options={tableOptions}
            title={tableTitle}
            data={fetchData}
        />
    );
};