import {
    ResponseErrorPanel,
    Table,
    TableColumn,
    Link,
    OverflowTooltip,
    Progress,
} from '@backstage/core-components';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { Box } from '@material-ui/core';
import {
    ANNOTATION_API_NAME,
    ApiDefinitionsListRequest,
    OwnershipType,
} from '@internal/plugin-api-platform-common';
import { useApi } from '@backstage/core-plugin-api';
import { apiPlatformBackendApiRef } from '../../api';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Query } from '@material-table/core';
import { ApiPlatformBackendApi } from '../../api/ApiPlatformBackendApi';
import { ComponentDisplayName } from '../common';

type TableRow = {
    id: number,
    name: string,
    description: string,
    system: string,
    entityRef: string,
}

const toEntityRow = (entity: Entity, idx: number): TableRow => ({
    id: idx,
    name: entity.metadata[ANNOTATION_API_NAME]?.toString() ?? '?',
    description: entity.metadata.description ?? '',
    system: entity.spec?.system?.toString() ?? '-',
    entityRef: stringifyEntityRef(entity),
});

const PAGE_SIZE = 20;

async function getData(apiPlatformApi: ApiPlatformBackendApi, query: Query<TableRow>, ownership: OwnershipType) {
    const page = query.page ?? 0;
    const pageSize = query.pageSize ?? PAGE_SIZE;
    const result = await apiPlatformApi.listApis({
        offset: page * pageSize,
        limit: pageSize,
        search: query.search,
        orderBy: query.orderBy ? {
            field: query.orderBy.field,
            direction: query.orderDirection,
        } as ApiDefinitionsListRequest['orderBy'] : undefined,
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

const columns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '25%',
        field: 'name',
        defaultSort: 'asc',
        highlight: true,
        render: ({ system, name }: TableRow) => (
            <Link to={`/api-platform/api/${system}/${name}`}>
                <ComponentDisplayName text={name} type='api'/>
            </Link>
        ),
    },
    {
        title: 'Description',
        field: 'description',
        width: '50%',
        render: ({ description }: TableRow) => (
            <OverflowTooltip text={description} line={2} />
        ),
    },
    {
        title: 'System',
        width: '10%',
        field: 'system',
        highlight: true,
        render: ({ system }: TableRow) =>
            system === '-' ? (
                <ComponentDisplayName text={system} type='system' />
            ) : (
                <Link to={`/api-platform/system/${system}`}>
                    <ComponentDisplayName text={system} type='system' />
                </Link>
            ),
    },
];

interface ApiPlatformTableProps {
    ownership: 'all' | 'owned';
}
    
export const ApiPlatformTable = ({ ownership }: ApiPlatformTableProps) => {
    const apiPlatformApi = useApi(apiPlatformBackendApiRef);
    const initialSearch = sessionStorage.getItem('apiPlatformTableSearch') || '';
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
            {ownership === 'owned' ? 'Owned' : 'All'} APIs ({countRows})
        </Box>
    ), [countRows, ownership]);


    useEffect(() => {
        const fetchCount = async () => {
            setLoadingCount(true);
            setError(null);
            try {
                const count = await apiPlatformApi.getApisCount(ownership);
                setCountRows(count);
            } catch (err) {
                setError(err as Error);
            } finally { 
                setLoadingCount(false);
            }
        };

        fetchCount();
    }, [apiPlatformApi, ownership]);

    const fetchData = useCallback(
        async (query: Query<TableRow>) => {
            if (query.search !== undefined) {
                sessionStorage.setItem('apiPlatformTableSearch', query.search);
            }
            return getData(apiPlatformApi, query, ownership);
        },
        [apiPlatformApi, ownership]
    );

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