import {
  HomePageToolkit,
} from '@backstage/plugin-home';
import { Avatar, Chip, List, ListItem, ListItemIcon, ListItemText, makeStyles } from '@material-ui/core';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { CategoryData, ToolkitLink } from '../../types/types';
import { Progress, ResponseErrorPanel, TabbedCard } from '@backstage/core-components';
import { useToolkitCategoryData } from '../../hooks';
import {
  Content,
  ContentHeader,
} from '@backstage/core-components';
import {
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useState } from 'react';

import { Link } from '@backstage/core-components';
import { withStyles } from '@material-ui/core/styles';
import MuiAccordion from '@material-ui/core/Accordion';

const Accordion = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion);

const useStyles = makeStyles(theme => ({
  toolkit: {
    display: 'flex',
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  tool: {
    margin: theme.spacing(0.5, 1),
  },
  label: {
    marginTop: theme.spacing(1),
    width: '72px',
    fontSize: '0.9em',
    lineHeight: '1.25',
    overflowWrap: 'break-word',
    color: theme.palette.text.secondary,
  },
  icon: {
    width: '64px',
    height: '64px',
    borderRadius: '50px',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: theme.shadows[1],
    backgroundColor: theme.palette.background.default,
  },
  img: {
    height: '38px',
    width: 'auto',
  },
}));

export const ToolkitCategoryCard = () => {
  const configApi = useApi(configApiRef);
  const baseUrl = configApi.getString('app.baseUrl');
  const classes = useStyles();
  const [expanded, setExpanded] = useState<string | false>(false);

  const { data, error, isLoading } = useToolkitCategoryData(baseUrl);

  const renderErrorPanel = (err: Error | string) => (
    <ResponseErrorPanel title="Could not fetch data." error={typeof err === 'string' ? new Error(err) : err} />
  );

  if (isLoading) return <Progress />;
  if (error) return renderErrorPanel(error);
  if (!data || Object.keys(data).length === 0) return renderErrorPanel('No data available');

  const handleChange = (panel: string) => (_: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Content>
      <ContentHeader title="Developer Tools" />

      {Object.entries(data).map(([categoryName, links], _) => (
        <>
          <Typography variant="body1">{categoryName}</Typography>
          {links.map(link => (
            <Chip
                key={link.label}
                label={link.label}
                variant="outlined"
                clickable
                avatar={<Avatar src={`${baseUrl}/${link.iconUrl}`} />}
            />
          ))}
        </>
      ))}
    </Content>
  );
};

/*

return (
    <Content>
      <ContentHeader title="Developer Tools" />

      {Object.entries(data).map(([categoryName, links], _) => (
        <Accordion
          key={categoryName}
          expanded={expanded === categoryName}
          onChange={handleChange(categoryName)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{categoryName}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List className={classes.toolkit}>
              {links.map(link => (
                <Link key={link.url} to={link.url} className={classes.tool}>
                  <ListItemIcon className={classes.icon}>
                    <img
                      className={classes.img}
                      src={`${baseUrl}/${link.iconUrl}`}
                      alt={link.label}
                    />
                  </ListItemIcon>
                  <ListItemText
                    secondaryTypographyProps={{ className: classes.label }}
                    secondary={link.label}
                  />
                </Link>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Content>
  );
};
*/