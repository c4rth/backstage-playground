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
import { useEffect, useState } from 'react';
import { Query } from '@material-table/core';
import { ApiPlatformBackendApi } from '../../api/ApiPlatformBackendApi';

type TableRow = {
    id: number,
    api: {
        name: string,
        description: string,
        system: string,
    },
    resolved: {
        entityRef: string,
    },
}

const columns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '25%',
        field: 'api.name',
        defaultSort: 'asc',
        highlight: true,
        render: ({ api }) => {
            return (
                <Link to={api.name}>
                    <ApiPlatformDisplayName
                        text={api.name}
                    />
                </Link>
            );
        },
    },
    {
        title: 'Description',
        field: 'api.description',
        width: '50%',
        render: ({ api }) => {
            return (
                <OverflowTooltip text={api.description} line={2} />
            )
        },
    },
    {
        title: 'System',
        width: '10%',
        field: 'api.system',
        highlight: true,
        render: ({ api }) => (
            <Link to={`/api-platform/system/${api.system}`}>
                <SystemPlatformDisplayName name={api.system} />
            </Link>
        ),
    },
];

const PAGE_SIZE = 20;

async function getData(apiPlatformApi: ApiPlatformBackendApi, query: Query<TableRow>) {
    const page = query.page || 0;
    const pageSize = query.pageSize || PAGE_SIZE;
    const result = await apiPlatformApi.listApis({
        offset: page * pageSize,
        limit: pageSize,
        search: query.search,
        orderBy: query?.orderBy &&
            ({
                field: query.orderBy.field,
                direction: query.orderDirection,
            } as ApiDefinitionListOptions['orderBy']),
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

function getCount(apiPlatformApi: ApiPlatformBackendApi) {
    return apiPlatformApi.getApisCount();
}

export const ApiPlatformTable = () => {
    const apiPlatformApi = useApi(apiPlatformBackendApiRef);
    const initialSearch = sessionStorage.getItem('apiPlatformTableSearch') || '';
    const [countRows, setCountRows] = useState<number>(0);
    const [loadingCount, setLoadingCount] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
 
    useEffect(() => {
        getCount(apiPlatformApi).then(count => {
            setCountRows(count);
            setLoadingCount(false);
        }).catch(err => {
            setError(err);
            setLoadingCount(false);
        });
    }, [apiPlatformApi]);

    if (loadingCount) {
        return <Progress />;
    }
    if (error) {
        return <ResponseErrorPanel error={error} />;
    }
    return (
        <Table<TableRow>
            isLoading={loadingCount}
            columns={columns}
            options={{
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
                    APIs ({countRows})
                </Box>
            }
            data={
                async query => {
                    sessionStorage.setItem('apiPlatformTableSearch', query.search || '');
                    return getData(apiPlatformApi, query);
                }
            }
        />
    );
};

function toEntityRow(entity: Entity, idx: number) {
    return {
        id: idx,
        api: {
            name: entity.metadata[ANNOTATION_API_NAME]?.toString() || '?',
            description: entity.metadata.description || '',
            system: entity.spec?.system?.toString() || '-',
        },
        resolved: {
            entityRef: stringifyEntityRef(entity),
        },
    };
}