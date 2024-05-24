import { InfoCard } from '@backstage/core-components';
import {
  ComponentAccordion,
  HomePageToolkit,
} from '@backstage/plugin-home';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import {  makeStyles } from '@material-ui/core';
import { ErrorReport } from '../../common';
import { QuickAccessLinks } from '../../types/types';
import { useCustomizationData } from '../../hooks/useCustomizationData';

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

const QuickAccess = () => {
    const classes = useStyles();
    const { data, error, isLoading } = useCustomizationData() as {
      data: QuickAccessLinks[] | undefined;
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
      <InfoCard title="Quick Access" noPadding className={classes.title}>
        {data.map(item => (
          <HomePageToolkit
            key={item.title}
            title={item.title}
            tools={item.links.map(link => ({
              ...link,
              icon: (
                <img
                  className={classes.img}
                  src={link.iconUrl}
                  alt={link.label}
                />
              ),
            }))}
            Renderer={
              item.isExpanded
                ? props => <ComponentAccordion expanded {...props} />
                : props => <ComponentAccordion {...props} />
            }
          />
        ))}
      </InfoCard>
    );
  };

  export default QuickAccess;