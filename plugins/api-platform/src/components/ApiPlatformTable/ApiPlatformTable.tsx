import {
    ResponseErrorPanel,
    Table,
    TableColumn,
    Link,
    OverflowTooltip,
} from '@backstage/core-components';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { useGetApis } from '../../hooks';
import { Box } from '@material-ui/core';
import {
    ANNOTATION_API_NAME,
} from '@internal/plugin-api-platform-common';
import { ApiPlatformDisplayName } from './ApiPlatformDisplayName';
import { SystemPlatformDisplayName } from '../SystemPlatformTable';

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


export const ApiPlatformTable = () => {
    const { items, loading, error } = useGetApis();
    const initialSearch = sessionStorage.getItem('apiPlatformTableSearch') || '';

    if (error) {
        return <ResponseErrorPanel error={error} />;
    }
    const rows = items?.map(toEntityRow) || [];
    const showPagination = rows.length > 20;
    return (
        <Table<TableRow>
            isLoading={loading}
            columns={columns}
            options={{
                search: true,
                paging: showPagination,
                padding: 'dense',
                pageSize: 20,
                showEmptyDataSourceMessage: !loading,
                draggable: false,
                thirdSortClick: false,     
                searchText: initialSearch,
            }}
            onSearchChange={search => {
                sessionStorage.setItem('apiPlatformTableSearch', search);
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    APIs ({items ? items.length : 0})
                </Box>
            }
            data={rows}
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