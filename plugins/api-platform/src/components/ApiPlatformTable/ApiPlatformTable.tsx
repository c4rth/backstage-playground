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
    ApiDefinitionListOptions,
} from '@internal/plugin-api-platform-common';
import { ApiPlatformDisplayName } from './ApiPlatformDisplayName';
import { SystemPlatformDisplayName } from '../SystemPlatformTable';
import { useApi } from '@backstage/core-plugin-api';
import { apiPlatformBackendApiRef } from '../../api';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Query } from '@material-table/core';
import { ApiPlatformBackendApi } from '../../api/ApiPlatformBackendApi';

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

async function getData(apiPlatformApi: ApiPlatformBackendApi, query: Query<TableRow>) {
    const page = query.page ?? 0;
    const pageSize = query.pageSize ?? PAGE_SIZE;
    const result = await apiPlatformApi.listApis({
        offset: page * pageSize,
        limit: pageSize,
        search: query.search,
        orderBy: query.orderBy ? {
            field: query.orderBy.field,
            direction: query.orderDirection,
        } as ApiDefinitionListOptions['orderBy'] : undefined,
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
        render: ({ name }: TableRow) => (
            <Link to={name}>
                <ApiPlatformDisplayName text={name} />
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
                <SystemPlatformDisplayName name={system} />
            ) : (
                <Link to={`/api-platform/system/${system}`}>
                    <SystemPlatformDisplayName name={system} />
                </Link>
            ),
    },
];

export const ApiPlatformTable = () => {
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
            APIs ({countRows})
        </Box>
    ), [countRows]);


    useEffect(() => {
        const fetchCount = async () => {
            setLoadingCount(true);
            setError(null);
            try {
                const count = await apiPlatformApi.getApisCount();
                setCountRows(count);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoadingCount(false);
            }
        };

        fetchCount();
    }, [apiPlatformApi]);

    const fetchData = useCallback(
        async (query: Query<TableRow>) => {
            if (query.search !== undefined) {
                sessionStorage.setItem('apiPlatformTableSearch', query.search);
            }
            return getData(apiPlatformApi, query);
        },
        [apiPlatformApi]
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