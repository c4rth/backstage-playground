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
} from '@internal/plugin-mca-components-common';
import { useGetMcaComponentsCount } from '@internal/plugin-mca-components';
import { useApi } from '@backstage/core-plugin-api';
import { mcaComponentsBackendApiRef } from '../../api';

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

export const McaComponentTable = () => {
    const { count: countRows, loading, error } = useGetMcaComponentsCount();
    const mcaApi = useApi(mcaComponentsBackendApiRef);

    if (loading) {
        return <Progress />;
    }
    if (error) {
        return <ResponseErrorPanel error={error} />;
    }
    return (
        <Table<TableRow>
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
                    MCA Components ({countRows})
                </Box>
            }
            data={async query => {
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
                });
                return {
                    data: result?.items.map(toEntityRow) || [],
                    totalCount: countRows,
                    page: Math.floor(result.offset / result.limit),
                };
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