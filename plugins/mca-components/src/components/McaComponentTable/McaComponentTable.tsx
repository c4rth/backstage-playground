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

const columns: TableColumn<TableRow>[] = [
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
        title: 'P+1',
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
        title: 'P+2',
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
        title: 'P+3',
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
        title: 'P+4',
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
    return {
        data: result?.items.map(toEntityRow) || [],
        totalCount: countRows,
        page: Math.floor(result.offset / result.limit),
    };
}

function getCount(mcaApi: McaComponentsBackendApi, type: McaComponentType) {
    return mcaApi.getMcaComponentsCount(type);
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
    const [countRows, setCountRows] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setSelectedType(props.type);
        getCount(mcaApi, props.type).then(count => {
            setCountRows(count);
            setLoading(false);
        }).catch(err => {
            setError(err);
            setLoading(false);
        }
        );
    }, [props.type, mcaApi]);


    if (loading) {
        return <Progress />;
    }
    if (error) {
        return <ResponseErrorPanel error={error} />;
    }
    return (
        <Table<TableRow>
            key={selectedType}
            columns={columns}
            options={{
                paginationPosition: 'bottom',
                search: true,
                padding: 'dense',
                pageSize: PAGE_SIZE,
                showEmptyDataSourceMessage: !loading,
                draggable: false,
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    {getTitle(selectedType)} ({countRows})
                </Box>
            }
            data={
                async query => {
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