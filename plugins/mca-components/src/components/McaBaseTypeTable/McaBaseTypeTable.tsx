import {
    ResponseErrorPanel,
    Table,
    TableColumn,
    Link,
    Progress,
} from '@backstage/core-components';
import { Box } from '@material-ui/core';
import {
    McaBaseType,
    McaBaseTypeListOptions,
} from '@internal/plugin-mca-components-common';
import { useApi } from '@backstage/core-plugin-api';
import { mcaComponentsBackendApiRef } from '../../api';
import { Query } from '@material-table/core';
import { McaComponentsBackendApi } from '../../api/McaComponentsBackendApi';
import { useEffect, useState } from 'react';

type TableRow = {
    id: number,
    baseType: string,
    packageName: string,
}

function getColumns(): TableColumn<TableRow>[] {
    return [
        {
            title: 'Name',
            width: '50%',
            field: 'baseType',
            defaultSort: 'asc',
            highlight: true,
            render: (row) => {
                return (
                    <Link to={row.baseType}>{row.baseType}</Link>
                );
            },
        },
        {
            title: 'Package',
            width: '50%',
            field: 'packageName',
        },
    ];
}

const PAGE_SIZE = 20;

async function getData(mcaApi: McaComponentsBackendApi, query: Query<TableRow>) {
    const page = query.page || 0;
    const pageSize = query.pageSize || PAGE_SIZE;
    const result = await mcaApi.listMcaBaseTypes({
        offset: page * pageSize,
        limit: pageSize,
        search: query.search,
        orderBy: query?.orderBy &&
            ({
                field: query.orderBy.field,
                direction: query.orderDirection,
            } as McaBaseTypeListOptions['orderBy']),
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

function getCount(mcaApi: McaComponentsBackendApi) {
    return mcaApi.getMcaBaseTypesCount();
}

export const McaBaseTypeTable = () => {
    const mcaApi = useApi(mcaComponentsBackendApiRef);
    const [countRows, setCountRows] = useState<number>(0);
    const [loadingCount, setLoadingCount] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const initialSearch = sessionStorage.getItem('mcaBaseTypeTableSearch') || '';

    useEffect(() => {
        getCount(mcaApi).then(count => {
            setCountRows(count);
            setLoadingCount(false);
        }).catch(err => {
            setError(err);
            setLoadingCount(false);
        });
    }, [mcaApi]);

    if (loadingCount) {
        return <Progress />;
    }
    if (error) {
        return <ResponseErrorPanel error={error} />;
    }
    return (
        <Table<TableRow>
            columns={getColumns()}
            options={{
                paginationPosition: 'bottom',
                search: true,
                padding: 'dense',
                pageSize: PAGE_SIZE,
                pageSizeOptions: [10, PAGE_SIZE, 50],
                showEmptyDataSourceMessage: !loadingCount,
                draggable: false,
                thirdSortClick: false,
                searchText: initialSearch,
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    BaseTypes ({countRows})
                </Box>
            }
            data={
                async query => {
                    sessionStorage.setItem('mcaBaseTypeTableSearch', query.search || '');
                    return getData(mcaApi, query);
                }
            }
        />
    );
};

function toEntityRow(item: McaBaseType, idx: number) {
    return {
        id: idx,
        baseType: item.baseType,
        packageName: item.packageName,
    };
}