import {
  HomePageToolkit,
} from '@backstage/plugin-home';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import { makeStyles } from '@material-ui/core';
import { useToolkitData } from '../../hooks/useToolkitData';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ToolkitLink } from '../../types/types';
import { ErrorReport } from './ErrorReport';

const useStyles = makeStyles(theme => ({
  img: {
    height: '40px',
    width: 'auto',
  },
  searchBar: {
    display: 'flex',
    maxWidth: '60vw',
    boxShadow: theme.shadows.at(1),
    borderRadius: '50px',
    margin: 'auto',
  },
  title: {
    'div > div > div > div > p': {
      textTransform: 'uppercase',
    },
  },
  notchedOutline: {
    borderStyle: 'none!important',
  },
}));

export const ToolkitCard = () => {

  const configApi = useApi(configApiRef);
  const baseUrl = configApi.getString('app.baseUrl')
  const classes = useStyles();
  const { data, error, isLoading } = useToolkitData(baseUrl) as {
    data: ToolkitLink[] | undefined;
    error: Error | undefined;
    isLoading: boolean;
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!data) {
    return (
      <ErrorReport title="Could not fetch data." errorText="Unknown error" />
    );
  }

  if (!isLoading && !data && error) {
    return (
      <ErrorReport title="Could not fetch data." errorText={error.toString()} />
    );
  }

  return (
    <HomePageToolkit
      tools={
        data.map(link => ({
          label: link.label,
          url: link.url,
          icon: (
            <img
              className={classes.img}
              src={`${baseUrl}/${link.iconUrl}`}
              alt={link.label}
            />
          ),
        }))
      }
    />
  );

};