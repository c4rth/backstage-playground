import {
  HomePageToolkit,
} from '@backstage/plugin-home';
import React from 'react';
import { makeStyles } from '@material-ui/core';
import { useToolkitData } from '../../hooks/useToolkitData';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ToolkitLink } from '../../types/types';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';

const useStyles = makeStyles(() => ({
  img: {
    height: '38px',
    width: 'auto',
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
    return <Progress />;
  }

  if (error) {
    return (
      <ResponseErrorPanel title="Could not fetch data." error={error} />
    );
  }

  if (!data) {
    return (
      <ResponseErrorPanel title="Could not fetch data." error={Error("Unknown error - no data")} />
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