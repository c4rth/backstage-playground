import {
    Link,
    Progress,
    ResponseErrorPanel,
    Table,
    TableColumn,
} from '@backstage/core-components';
import { Box, Divider, List, ListItem, Typography } from '@material-ui/core';
import { useGetServices } from '../../hooks';
import { ServicePlatformChip } from './ServicePlatformChip';
import { ServiceDefinition } from '@internal/plugin-api-platform-common';
import { Fragment, useCallback, useMemo } from 'react';
import { ComponentDisplayName } from '../common';

type TableRow = {
    id: number,
    serviceDefinition: ServiceDefinition,
}

const listStyle = { padding: '0px', margin: '0px' };
const listItemStyle = {
    margin: '2px',
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center" as const
};
const emptyStateStyle = { pointerEvents: 'none' as const };

function createEnvironmentColumn(env: string): TableColumn<TableRow> {
    return {
        title: env.toUpperCase(),
        width: '12%',
        align: 'center',
        cellStyle: { padding: '0px' },
        sorting: false,
        searchable: true,
        customFilterAndSearch: (query, row) => {
            if (!row.serviceDefinition?.versions) return false;
            const lowerQuery = query.toLowerCase();
            return row.serviceDefinition.versions.some(version => {
                const envData = version.environments[env as keyof typeof version.environments];
                return envData?.imageVersion.toLowerCase().includes(lowerQuery);
            });
        },
        render: ({ serviceDefinition }) => {
            return (
                <List style={listStyle}>
                    {serviceDefinition.versions?.map((version, idx) => (
                        <Fragment key={`${serviceDefinition.name}-${version.version}-${idx}`}>
                            <ListItem style={listItemStyle}>
                                {env in version.environments ? (
                                    <ServicePlatformChip
                                        index={idx}
                                        service={version.environments[env as keyof typeof version.environments]}
                                        link={`/api-platform/service/${serviceDefinition.serviceName}?system=${serviceDefinition.system}&version=${version.version}&env=${env}`}
                                    />
                                ) : (
                                    <div style={emptyStateStyle}>
                                        <Typography variant='body1'>-</Typography>
                                    </div>
                                )}
                            </ListItem>
                            {idx < serviceDefinition.versions.length - 1 && <Divider />}
                        </Fragment>
                    ))}
                </List>
            );
        },
    };
}

const toRow = (serviceDefinition: ServiceDefinition, idx: number): TableRow => ({
    id: idx,
    serviceDefinition,
});

export const ServicePlatformTable = () => {
    const { items, loading, error } = useGetServices();
    const initialSearch = sessionStorage.getItem('servicePlatformTableSearch') ?? '';


    const columns: TableColumn<TableRow>[] = useMemo(() => [
        {
            title: 'Name',
            width: '25%',
            field: 'serviceDefinition.name',
            highlight: true,
            defaultSort: 'asc',
            render: ({ serviceDefinition }) => (
                <Link to={`/api-platform/service/${serviceDefinition.serviceName}?system=${serviceDefinition.system}`}>
                    <ComponentDisplayName text={serviceDefinition.serviceName} type="service" />
                </Link>
            ),
        },
        {
            title: 'Versions',
            width: '5%',
            field: 'version',
            sorting: false,
            align: 'center',
            cellStyle: { padding: '0px' },
            render: ({ serviceDefinition }) => (
                <List style={listStyle}>
                    {serviceDefinition.versions?.map((version, idx) => (
                        <Fragment key={`${serviceDefinition.name}-${version.version}-${idx}`}>
                            <ListItem style={listItemStyle}>
                                <ServicePlatformChip
                                    index={idx}
                                    text={version.version}
                                    link={`/api-platform/service/${serviceDefinition.serviceName}?system=${serviceDefinition.system}&version=${version.version}`}
                                />
                            </ListItem>
                            {idx < serviceDefinition.versions.length - 1 && <Divider />}
                        </Fragment>
                    ))}
                </List>
            ),
        },
        createEnvironmentColumn('tst'),
        createEnvironmentColumn('gtu'),
        createEnvironmentColumn('uat'),
        createEnvironmentColumn('ptp'),
        createEnvironmentColumn('prd'),
        {
            title: 'System',
            width: '10%',
            highlight: true,
            field: 'serviceDefinition.system',
            render: ({ serviceDefinition }) => (
                <Link to={`/api-platform/system/${serviceDefinition.system}`}>
                    <ComponentDisplayName text={serviceDefinition.system} type="system" />
                </Link>
            ),
        },
    ], []);

    const rows = useMemo(() => (items?.map(toRow) ?? []), [items]);
    const showPagination = rows.length > 20;
    const itemsCount = items?.length ?? 0;

    const handleSearchChange = useCallback((search: string) => {
        sessionStorage.setItem('servicePlatformTableSearch', search);
    }, []);


    if (loading) return <Progress />;
    if (error) return <ResponseErrorPanel error={error} />;

    return (
        <Table<TableRow>
            columns={columns}
            options={{
                search: true,
                padding: 'dense',
                paging: showPagination,
                pageSize: 20,
                showEmptyDataSourceMessage: !loading,
                draggable: false,
                thirdSortClick: false,
                searchText: initialSearch,
            }}
            onSearchChange={handleSearchChange}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    Services ({itemsCount})
                </Box>
            }
            data={rows}
        />
    );
};