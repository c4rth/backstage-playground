import {
  HomePageToolkit,
} from '@backstage/plugin-home';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import { makeStyles } from '@material-ui/core';
import { ErrorReport } from '../../common';
import { ToolkitLink } from '../../types/types';
import { useToolkitData } from '../../hooks/useToolkitData';

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

const Toolkit = () => {
  const classes = useStyles();
  const { data, error, isLoading } = useToolkitData() as {
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
              src={link.iconUrl}
              alt={link.label}
            />
          ),
        }))
      }
    />
  );

};

export default Toolkit;