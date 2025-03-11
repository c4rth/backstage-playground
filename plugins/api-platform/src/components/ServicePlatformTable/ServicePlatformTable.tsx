import {
    Link,
    Progress,
    ResponseErrorPanel,
    Table,
    TableColumn,
} from '@backstage/core-components';
import {
    EntityRefLink,
} from '@backstage/plugin-catalog-react';
import { parseEntityRef } from '@backstage/catalog-model';
import React from 'react';
import { Box, Divider, List, ListItem } from '@material-ui/core';
import { useGetServices } from '../../hooks';
import { ServicePlatformDisplayName } from './ServicePlatformDisplayName';
import { ServicePlatformChip } from './ServicePlatformChip';
import { ServiceDefinition, ServiceVersionDefinition } from '@internal/plugin-api-platform-common';
import NotInterestedIcon from '@material-ui/icons/NotInterested';

type TableRow = {
    id: number,
    serviceDefinition: ServiceDefinition,
}

function getColumn(env: string): TableColumn<TableRow> {
    return {
        title: env.toUpperCase(),
        width: '10%',
        align: 'center',
        cellStyle: { padding: '0px' },
        sorting: false,
        searchable: true,
        customFilterAndSearch: (query, row) => {
            if (!row.serviceDefinition) return false;
            let res = false;
            for (const version of row.serviceDefinition.versions) {
                if (version.environments.hasOwnProperty(env)) {
                    const v = version.environments[env as keyof typeof version.environments]
                    if (v?.imageVersion.includes(query.toLowerCase())) {
                        res = true;
                    }
                }
            };
            return res;
        },
        render: ({ serviceDefinition }) => {
            return (
                <List style={{ padding: '0px', margin: '0px' }}>
                    {serviceDefinition.versions &&
                        serviceDefinition.versions.map((version: ServiceVersionDefinition, idx: number) =>
                        (
                            <>
                                <ListItem key={idx} 
                                style={{ margin: '2px', display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                                    {version.environments.hasOwnProperty(env) ?
                                        <ServicePlatformChip
                                            index={idx}
                                            service={version.environments[env as keyof typeof version.environments]}
                                            link={`/api-platform/service/${serviceDefinition.name}?version=${version.version}&env=${env}`} />
                                        : <ServicePlatformChip
                                            index={-2}
                                            icon={<NotInterestedIcon />}
                                            text='N/A'
                                            disabled
                                            link="#" />}
                                </ListItem>
                                {idx < serviceDefinition.versions.length - 1 && <Divider />}
                            </>
                        )
                        )}
                </List>
            );
        },
    };
}

const columns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '25%',
        field: 'serviceDefinition.name',
        highlight: true,
        render: ({ serviceDefinition }) => {
            return (
                <Link to={serviceDefinition.name}>
                    <ServicePlatformDisplayName
                        text={serviceDefinition.name} />
                </Link>
            );
        },
    },
    {
        title: 'Versions',
        width: '5%',
        field: 'version',
        sorting: false,
        align: 'center',
        cellStyle: { padding: '0px' },
        render: ({ serviceDefinition }) => {
            return (
                <List style={{ padding: '0px', margin: '0px' }}>
                    {serviceDefinition.versions &&
                        serviceDefinition.versions.map((v: any, idx: number) => (
                            <>
                                <ListItem key={idx} style={{ display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                                    <ServicePlatformChip index={idx} text={v.version} link={`/api-platform/service/${serviceDefinition.name}?version=${v.version}`} />
                                </ListItem>
                            {idx < serviceDefinition.versions.length - 1 && <Divider />}
                            </>
                        ))}
                </List>
            );
        },
    },
    getColumn('tst'),
    getColumn('gtu'),
    getColumn('uat'),
    getColumn('ptp'),
    getColumn('prd'),
    {
        title: 'Owner',
        width: '25%',
        field: 'serviceDefinition.owner',
        render: ({ serviceDefinition }) => (
            <EntityRefLink
                entityRef={parseEntityRef(serviceDefinition.owner)}
            />
        ),
    },
];

export const ServicePlatformTable = () => {
    const { items, loading, error } = useGetServices();

    if (loading) {
        return <Progress />;
    }
    if (error) {
        return <ResponseErrorPanel error={error} />;
    }
    const rows = items?.map(toRow) || [];
    const showPagination = rows.length > 20 || false;

    return (
        <Table<TableRow>
            columns={columns}
            options={{
                search: true,
                padding: 'dense',
                paging: showPagination,
                pageSize: 20,
                showEmptyDataSourceMessage: !loading,
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    Services ({items ? items.length : 0})
                </Box>
            }
            data={rows}
        />
    );
};


function toRow(serviceDefinition: ServiceDefinition, idx: number) {
    return {
        id: idx,
        serviceDefinition: serviceDefinition,
    };
}