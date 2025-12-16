import {
    ResponseErrorPanel,
    Table,
    TableColumn,
    Link,
    Progress,
} from '@backstage/core-components';
import {
    McaComponent,
    McaComponentListOptions,
    McaComponentType,
    McaVersions,
} from '@internal/plugin-mca-common';
import { useApi } from '@backstage/core-plugin-api';
import { mcaComponentsBackendApiRef } from '../../api';
import { Query } from '@material-table/core';
import { McaComponentsBackendApi } from '../../api/McaComponentsBackendApi';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Flex } from '@backstage/ui';

type TableRow = {
    id: number,
    component: string,
    prdVersion: string,
    p1Version: string,
    p2Version: string,
    p3Version: string,
    p4Version: string,
    applicationCode: string,
    packageName: string,
}


function getColumns(versions?: McaVersions): TableColumn<TableRow>[] {
    const columns: TableColumn<TableRow>[] = [
        {
            title: 'Name',
            width: '45%',
            field: 'component',
            defaultSort: 'asc',
            highlight: true,
            render: (row) => (
                <Link to={row.component}>{row.component}</Link>
            ),
        },
        {
            title: 'PRD',
            width: '5%',
            field: 'prdVersion',
            highlight: true,
            render: (row) => (
                <Link to={`${row.component}?version=${row.prdVersion}`}>{row.prdVersion}</Link>
            ),
        },
        {
            title: versions?.p1Version || 'P+1',
            width: '5%',
            field: 'p1Version',
            highlight: true,
            render: (row) => (
                <Link to={`${row.component}?version=${row.p1Version}`}>{row.p1Version}</Link>
            ),
        },
        {
            title: versions?.p2Version || 'P+2',
            width: '5%',
            field: 'p2Version',
            highlight: true,
            render: (row) => (
                <Link to={`${row.component}?version=${row.p2Version}`}>{row.p2Version}</Link>
            ),
        },
        {
            title: versions?.p3Version || 'P+3',
            width: '5%',
            field: 'p3Version',
            highlight: true,
            render: (row) => (
                <Link to={`${row.component}?version=${row.p3Version}`}>{row.p3Version}</Link>
            ),
        },
    ];
    if (versions?.p4Version !== '') {
        columns.push(
            {
                title: versions?.p4Version || 'P+4',
                width: '5%',
                field: 'p4Version',
                highlight: true,
                render: (row) => (
                    <Link to={`${row.component}?version=${row.p4Version}`}>{row.p4Version}</Link>
                ),
            }
        );
    }

    columns.push(
        {
            title: 'Package',
            width: '20%',
            field: 'packageName',
        },
        {
            title: 'System',
            width: '10%',
            field: 'applicationCode',
        }
    );
    return columns;
}

const PAGE_SIZE = 20;
const STORAGE_KEY = 'mcaComponentTableSearch';

const toEntityRow = (mca: McaComponent, idx: number): TableRow => ({
    id: idx,
    component: mca.component,
    prdVersion: mca.prdVersion,
    p1Version: mca.p1Version,
    p2Version: mca.p2Version,
    p3Version: mca.p3Version,
    p4Version: mca.p4Version,
    applicationCode: mca.applicationCode,
    packageName: mca.packageName,
});

async function getData(mcaApi: McaComponentsBackendApi, query: Query<TableRow>, type: McaComponentType) {
    const page = query.page || 0;
    const pageSize = query.pageSize || PAGE_SIZE;
    const result = await mcaApi.listMcaComponents({
        offset: page * pageSize,
        limit: pageSize,
        search: query.search,
        orderBy: query?.orderBy ? {
            field: query.orderBy.field,
            direction: query.orderDirection,
        } as McaComponentListOptions['orderBy'] : undefined,
        type: type,
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

const getCount = (mcaApi: McaComponentsBackendApi, type: McaComponentType) =>
    mcaApi.getMcaComponentsCount(type);

const getVersions = (mcaApi: McaComponentsBackendApi) =>
    mcaApi.getMcaVersions();

function getTitle(type: McaComponentType) {
    switch (type) {
        case 'operation':
            return 'Operations';
        case 'element':
            return 'Elements';
        case 'all':
            return 'All components';
        default:
            return 'Unknown type';
    }
}

type McaComponentTableProps = {
    type: McaComponentType;
};

export const McaComponentTable = memo<McaComponentTableProps>(({ type }) => {
    const mcaApi = useApi(mcaComponentsBackendApiRef);
    const [selectedType, setSelectedType] = useState<McaComponentType>(type);
    const [mcaVersions, setMcaVersions] = useState<McaVersions>();
    const [countRows, setCountRows] = useState<number>(0);
    const [loadingCount, setLoadingCount] = useState(true);
    const [loadingVersions, setLoadingVersions] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const initialSearch = useMemo(() =>
        sessionStorage.getItem(STORAGE_KEY) || '', []
    );
    const columns = useMemo(() =>
        getColumns(mcaVersions), [mcaVersions]
    );

    const tableOptions = useMemo(() => ({
        paginationPosition: 'bottom' as const,
        search: true,
        padding: 'dense' as const,
        pageSize: PAGE_SIZE,
        pageSizeOptions: [10, PAGE_SIZE, 50],
        showEmptyDataSourceMessage: !loadingVersions && !loadingCount,
        draggable: false,
        thirdSortClick: false,
        searchText: initialSearch,
    }), [loadingVersions, loadingCount, initialSearch]);

    const tableTitle = useMemo(() => (
        <Flex align="center">
            {getTitle(selectedType)} ({countRows})
        </Flex>
    ), [selectedType, countRows]);

    const dataFetcher = useCallback(async (query: Query<TableRow>) => {
        if (query.search !== undefined) {
            sessionStorage.setItem(STORAGE_KEY, query.search);
        }

        return getData(mcaApi, query, selectedType);
    }, [mcaApi, selectedType]);

    useEffect(() => {
        getVersions(mcaApi)
            .then(versions => setMcaVersions(versions))
            .catch(setError)
            .finally(() => setLoadingVersions(false));
    }, [mcaApi]);

    useEffect(() => {
        setSelectedType(type);
        getCount(mcaApi, type)
            .then(setCountRows)
            .catch(setError)
            .finally(() => setLoadingCount(false));
    }, [type, mcaApi]);

    if (loadingVersions || loadingCount) return <Progress />;
    if (error) return <ResponseErrorPanel error={error} />;

    return (
        <Table<TableRow>
            key={selectedType}
            columns={columns}
            options={tableOptions}
            title={tableTitle}
            data={dataFetcher}
        />
    );
});