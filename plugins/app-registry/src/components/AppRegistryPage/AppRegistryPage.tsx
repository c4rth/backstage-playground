import React, { useState } from 'react';
import {
  Progress,
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
import { Box, Dialog, DialogContent, DialogTitle, IconButton, makeStyles, Typography } from '@material-ui/core';
import { AppRegistryOperation } from '../../types';
import MapIcon from '@material-ui/icons/Map';
import CloseIcon from '@material-ui/icons/Close';

type TableRow = {
  id: number,
  operation: AppRegistryOperation,
  open: boolean,
}

const useStyles = makeStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

const PdpMappingDialog = ({ row }: { row: TableRow }) => {
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  return (
    <Box>
      <IconButton size="small" onClick={() => setOpen(!open)}>
        <MapIcon />
      </IconButton>
      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogTitle id="dialog-title">
          PDP Mapping
          <IconButton className={classes.closeButton} onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
            <Table
              options={{
                search: false,
                paging: false,
                padding: 'dense',
                showTitle: false,
                toolbar: false,
              }}
              columns={[
                { title: 'Value Path', field: 'valuePath' },
                { title: 'PDP Field', field: 'pdpField' },
              ]}
              data={row.operation.pdpMapping || []}
            />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

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
    render: row => row.operation.pdpMapping ?
      <PdpMappingDialog row={row} />
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

  if (loading) {
    return <Progress />;
  } else if (error) {
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
