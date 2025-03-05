import React, { useState } from 'react';
import {
  Progress,
  ResponseErrorPanel,
  StatusAborted,
  StatusOK,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { ComponentEntity } from "@backstage/catalog-model";
import { useEntity } from '@backstage/plugin-catalog-react';
import { useGetOperations } from '../../hooks';
import { ANNOTATION_SERVICE_NAME, ANNOTATION_SERVICE_VERSION } from "@internal/plugin-api-platform-common";
import { Box, Collapse, IconButton, Typography } from '@material-ui/core';
import { AppRegistryOperation } from '../../types';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

type TableRow = {
  id: number,
  operation: AppRegistryOperation,
  open: boolean,
}

const ExpandRow = ({ row }: { row: TableRow }) => {
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <IconButton size="small" onClick={() => setOpen(!open)}>
        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </IconButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box margin={1}>
          <Table
            title="PDP Mapping"
            options={{
              search: false,
              paging: false,
              padding: 'dense',
          }}
            columns={[
              { title: 'Value Path', field: 'valuePath' },
              { title: 'PDP Field', field: 'pdpField' },
            ]}
            data={row.operation.pdpMapping || []}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

const columns: TableColumn<TableRow>[] = [
  {
    title: '',
    width: '1%',
    field: 'id',
    render: row => row.operation.pdpMapping ? <ExpandRow row={row} /> : null,
  },
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
      width: '10%',
      render: ({ operation }) => {
          return operation.abac ? <StatusOK /> : <StatusAborted />;
      }
  },
  {
      title: 'BFunction',
      width: '14%',
      field: 'operation.bFunction',
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

  const showPagination = rows.length > 15;

  return (
    <Table<TableRow>
            isLoading={loading}
            columns={columns}
            options={{
                search: true,
                paging: showPagination,
                padding: 'dense',
                pageSize: 15,
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
