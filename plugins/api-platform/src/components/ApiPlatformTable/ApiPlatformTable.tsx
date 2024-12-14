import {
    ResponseErrorPanel,
    Table,
    TableColumn,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import React from 'react';
import { useApiDefinitions } from '../../hooks';
import { Box } from '@material-ui/core';


const columns: TableColumn[] = [
    {
        title: 'App',
        field: 'project',
        highlight: false,
        width: '5%',
        resizable: true,
    },
    {
        title: 'Name',
        field: 'name',
        highlight: true,
        width: '25%',
        resizable: true,
    },
    {
        title: 'Title',
        field: 'title',
        highlight: false,
        width: '25%',
        resizable: true,
    },
    {
        title: 'Description',
        field: 'description',
        highlight: false,
        width: '47%',
        resizable: true,
    }
];

/**
 * ApiPlatformTable
 * @public
 */
export const ApiPlatformTable = () => {

    const configApi = useApi(configApiRef);

    const { items, loading, error } = useApiDefinitions();

    if (error) {
        return <ResponseErrorPanel error={error} />;
    }

    return (
        <Table
            isLoading={loading}
            columns={columns}
            options={{
                search: true,
                paging: true,
                pageSize: 15,
                showEmptyDataSourceMessage: !loading,
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    API ({items ? items.length : 0})
                </Box>
            }
            data={items ?? []}
        />
    );
};