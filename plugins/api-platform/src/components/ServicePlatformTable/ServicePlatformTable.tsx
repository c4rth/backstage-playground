import {
    Link,
    ResponseErrorPanel,
    Table,
    TableColumn,
} from '@backstage/core-components';
import {
    EntityRefLink,
} from '@backstage/plugin-catalog-react';
import { parseEntityRef } from '@backstage/catalog-model';
import React from 'react';
import { Box } from '@material-ui/core';
import { useGetServices } from '../../hooks';
import { ServicePlatformDisplayName } from './ServicePlatformDisplayName';
import { ServicePlatformChip } from './ServicePlarformChip';


const columns: TableColumn[] = [
    {
        title: 'Name',
        width: '25%',
        field: 'name',
        highlight: true,
        render: (data: any) => {
            return (
                <Link to={data.name}>
                    <ServicePlatformDisplayName
                        name={data.name} />
                </Link>
            );
        },
    },
    {
        title: 'Version',
        width: '5%',
        field: 'version',
        render: (data: any) => {
            return (
                <div>
                    {data.versions &&
                        data.versions.map((v: any, idx: number) => (
                            <ServicePlatformChip index={idx} text={v.version} />
                        ))}
                </div>
            );
        },
    },
    {
        title: 'TST',
        width: '10%',
        align: 'center',
        render: (data: any) => {
            return (
                <div>
                    {data.versions &&
                        data.versions.map((v: any, idx: number) =>
                            v.environments.tst ?
                                <ServicePlatformChip index={idx} service={v.environments.tst} />
                                : <div />
                        )}
                </div>
            );
        },
    },
    {
        title: 'GTU',
        width: '10%',
        align: 'center',
        render: (data: any) => {
            return (
                <div>
                    {data.versions &&
                        data.versions.map((v: any, idx: number) =>
                            v.environments.gtu ?
                                <ServicePlatformChip index={idx} service={v.environments.gtu} />
                                : <div />
                        )}
                </div>
            );
        },
    },
    {
        title: 'UAT',
        width: '10%',
        align: 'center',
        render: (data: any) => {
            return (
                <div>
                    {data.versions &&
                        data.versions.map((v: any, idx: number) =>
                            v.environments.uat ?
                                <ServicePlatformChip index={idx} service={v.environments.uat} />
                                : <div />
                        )}
                </div>
            );
        },
    },
    {
        title: 'PTP',
        width: '10%',
        align: 'center',
        render: (data: any) => {
            return (
                <div>
                    {data.versions &&
                        data.versions.map((v: any, idx: number) =>
                            v.environments.ptp ?
                                <ServicePlatformChip index={idx} service={v.environments.ptp} />
                                : <div />
                        )}
                </div>
            );
        },
    },
    {
        title: 'PRD',
        width: '10%',
        align: 'center',
        render: (data: any) => {
            return (
                <div>
                    {data.versions &&
                        data.versions.map((v: any, idx: number) =>
                            v.environments.prd ?
                                <ServicePlatformChip index={idx} service={v.environments.prd} />
                                : <div />
                        )}
                </div>
            );
        },
    },
    {
        title: 'Owner',
        width: '25%',
        field: 'owner',
        render: (data: any) => (
            <EntityRefLink
                entityRef={parseEntityRef(data.owner)}
            />
        ),
    },
];

export const ServicePlatformTable = () => {
    const { items, loading, error } = useGetServices();
    if (error) {
        return <ResponseErrorPanel error={error} />;
    }

    return (
        <Table
            isLoading={loading}
            columns={columns}
            options={{
                search: true,
                padding: 'dense',
                paging: true,
                pageSize: 15,
                showEmptyDataSourceMessage: !loading,
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    Services ({items ? items.length : 0})
                </Box>
            }
            data={items ?? []}
        />
    );
};