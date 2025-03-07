import React from 'react';
import {
  ResponseErrorPanel,
  StatusOK,
  StatusPending,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { ComponentEntity } from "@backstage/catalog-model";
import { useEntity } from '@backstage/plugin-catalog-react';
import { useGetOperations } from '../../hooks';
import { ANNOTATION_SERVICE_NAME, ANNOTATION_SERVICE_VERSION } from "@internal/plugin-api-platform-common";
// import { Box, Dialog, DialogContent, DialogTitle, IconButton, makeStyles, Typography } from '@material-ui/core';
import { Box, IconButton, Typography } from '@material-ui/core';
import { AppRegistryOperation } from '../../types';
import MapIcon from '@material-ui/icons/Map';
// import CloseIcon from '@material-ui/icons/Close';
import { AppRegistryPdpMappingPopOver } from './AppRegistryPdpMappingPopOver';

type TableRow = {
  id: number,
  operation: AppRegistryOperation,
  open: boolean,
}

const columns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '75%',
    field: 'operation.name',
    highlight: true,
    render: ({ operation }) => {
      return (
        <Typography variant="body2">
          {operation.name}
        </Typography>
      );
    },
  },
  {
    title: 'ABAC',
    field: 'operation.abac',
    width: '5%',
    render: ({ operation }) => {
      return operation.abac ? <StatusOK /> : <StatusPending />;
    },
  },
  {
    title: 'B-Function',
    width: '10%',
    field: 'operation.bFunction',
  },
  {
    title: 'PDP Mapping',
    width: '10%',
    field: 'id',
    render: ({ operation }) => operation.pdpMapping ?
      <AppRegistryPdpMappingPopOver operation={operation}>
        <IconButton size="small" onClick={() => { }}>
          <MapIcon />
        </IconButton>
      </AppRegistryPdpMappingPopOver>
      : null,
  },
];

function toTableRow(operation: AppRegistryOperation, idx: number) {
  return {
    id: idx,
    operation: operation,
    open: true,
  };
}

export const AppRegistryPage = () => {

  const { entity } = useEntity<ComponentEntity>();

  const appCode = entity.spec.system;
  const appName = entity.metadata[ANNOTATION_SERVICE_NAME]?.toString();
  const appVersion = entity.metadata[ANNOTATION_SERVICE_VERSION]?.toString();
  const environment = entity.spec?.lifecycle.toUpperCase();

  const { data, loading, error } = useGetOperations(appCode, appName, appVersion, environment);

  if (error) {
    return <ResponseErrorPanel title="Failed to call AppRegistry" error={error} />;
  }

  const rows = data?.map(toTableRow) || [];

  return (
    <Table<TableRow>
      isLoading={loading}
      columns={columns}
      options={{
        search: true,
        padding: 'dense',
        paging: false,
        showEmptyDataSourceMessage: !loading,
      }}
      title={
        <Box display="flex" alignItems="center">
          <Box mr={1} />
          Operations ({rows ? rows.length : 0})
        </Box>
      }
      data={rows}
    />
  );
};
