import {
    ResponseErrorPanel,
    Table,
    TableColumn,
    Link,
    Progress,
} from '@backstage/core-components';
import { Box } from '@material-ui/core';
import {
    McaComponent,
    McaComponentListOptions,
    McaComponentType,
    McaVersions,
} from '@internal/plugin-mca-components-common';
import { useApi } from '@backstage/core-plugin-api';
import { mcaComponentsBackendApiRef } from '../../api';
import { Query } from '@material-table/core';
import { McaComponentsBackendApi } from '../../api/McaComponentsBackendApi';
import { useEffect, useState } from 'react';

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
    return [
        {
            title: 'Name',
            width: '45%',
            field: 'component',
            defaultSort: 'asc',
            highlight: true,
            render: (row) => {
                return (
                    <Link to={row.component}>{row.component}</Link>
                );
            },
        },
        {
            title: 'PRD',
            width: '5%',
            field: 'prdVersion',
            highlight: true,
            render: (row) => {
                return (
                    <Link to={`${row.component}?version=${row.prdVersion}`}>{row.prdVersion}</Link>
                );
            },
        },
        {
            title: versions?.p1Version || 'P+1',
            width: '5%',
            field: 'p1Version',
            highlight: true,
            render: (row) => {
                return (
                    <Link to={`${row.component}?version=${row.p1Version}`}>{row.p1Version}</Link>
                );
            },
        },
        {
            title: versions?.p2Version || 'P+2',
            width: '5%',
            field: 'p2Version',
            highlight: true,
            render: (row) => {
                return (
                    <Link to={`${row.component}?version=${row.p2Version}`}>{row.p2Version}</Link>
                );
            },
        },
        {
            title: versions?.p3Version || 'P+3',
            width: '5%',
            field: 'p3Version',
            highlight: true,
            render: (row) => {
                return (
                    <Link to={`${row.component}?version=${row.p3Version}`}>{row.p3Version}</Link>
                );
            },
        },
        {
            title: versions?.p4Version || 'P+4',
            width: '5%',
            field: 'p4Version',
            highlight: true,
            render: (row) => {
                return (
                    <Link to={`${row.component}?version=${row.p4Version}`}>{row.p4Version}</Link>
                );
            },
        },
        {
            title: 'Package',
            width: '20%',
            field: 'packageName',
        },
        {
            title: 'System',
            width: '10%',
            field: 'applicationCode',
        },
    ];
}

const PAGE_SIZE = 20;

type McaComponentTableProps = {
    type: McaComponentType;
};

async function getData(mcaApi: McaComponentsBackendApi, query: Query<TableRow>, type: McaComponentType, countRows: number) {
    const page = query.page || 0;
    const pageSize = query.pageSize || PAGE_SIZE;
    const result = await mcaApi.listMcaComponents({
        offset: page * pageSize,
        limit: pageSize,
        search: query.search,
        orderBy: query?.orderBy &&
            ({
                field: query.orderBy.field,
                direction: query.orderDirection,
            } as McaComponentListOptions['orderBy']),
        type: type,
    });
    if (result) {
        return {
            data: result.items.map(toEntityRow) || [],
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

function getCount(mcaApi: McaComponentsBackendApi, type: McaComponentType) {
    return mcaApi.getMcaComponentsCount(type);
}

function getVersions(mcaApi: McaComponentsBackendApi) {
    return mcaApi.getMcaVersions();
}

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

export const McaComponentTable = (props: McaComponentTableProps) => {
    const mcaApi = useApi(mcaComponentsBackendApiRef);
    const [selectedType, setSelectedType] = useState<McaComponentType>(props.type);
    const [mcaVersions, setMcaVersions] = useState<McaVersions>();
    const [countRows, setCountRows] = useState<number>(0);
    const [loadingCount, setLoadingCount] = useState<boolean>(true);
    const [loadingVersions, setLoadingVersions] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const initialSearch = sessionStorage.getItem('mcaComponentTableSearch') || '';

    useEffect(() => {
        getVersions(mcaApi).then(versions => {
            setMcaVersions(versions);
            setLoadingVersions(false);
        }).catch(err => {
            setError(err);
            setLoadingVersions(false);
        });
    }, [mcaApi])

    useEffect(() => {
        setSelectedType(props.type);
        getCount(mcaApi, props.type).then(count => {
            setCountRows(count);
            setLoadingCount(false);
        }).catch(err => {
            setError(err);
            setLoadingCount(false);
        }
        );
    }, [props.type, mcaApi]);


    if (loadingVersions || loadingCount) {
        return <Progress />;
    }
    if (error) {
        return <ResponseErrorPanel error={error} />;
    }
    return (
        <Table<TableRow>
            key={selectedType}
            columns={getColumns(mcaVersions)}
            options={{
                paginationPosition: 'bottom',
                search: true,
                padding: 'dense',
                pageSize: PAGE_SIZE,
                pageSizeOptions: [10, PAGE_SIZE, 50],
                showEmptyDataSourceMessage: !loadingVersions && !loadingCount,
                draggable: false,
                thirdSortClick: false,
                searchText: initialSearch,
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    {getTitle(selectedType)} ({countRows})
                </Box>
            }
            data={
                async query => {
                    sessionStorage.setItem('mcaComponentTableSearch', query.search || '');
                    return getData(mcaApi, query, selectedType, countRows);
                }
            }
        />
    );
};

function toEntityRow(mca: McaComponent, idx: number) {
    return {
        id: idx,
        component: mca.component,
        prdVersion: mca.prdVersion,
        p1Version: mca.p1Version,
        p2Version: mca.p2Version,
        p3Version: mca.p3Version,
        p4Version: mca.p4Version,
        applicationCode: mca.applicationCode,
        packageName: mca.packageName,
    };
}