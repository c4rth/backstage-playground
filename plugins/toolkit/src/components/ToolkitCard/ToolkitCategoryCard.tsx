
import { Avatar, Chip, } from '@material-ui/core';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { Progress, ResponseErrorPanel,  } from '@backstage/core-components';
import { useToolkitCategoryData } from '../../hooks';
import {
  Content,
  ContentHeader,
} from '@backstage/core-components';
import {
  Typography,
} from '@material-ui/core';

export const ToolkitCategoryCard = () => {
  const configApi = useApi(configApiRef);
  const baseUrl = configApi.getString('app.baseUrl');

  const { data, error, isLoading } = useToolkitCategoryData(baseUrl);

  const renderErrorPanel = (err: Error | string) => (
    <ResponseErrorPanel title="Could not fetch data." error={typeof err === 'string' ? new Error(err) : err} />
  );

  if (isLoading) return <Progress />;
  if (error) return renderErrorPanel(error);
  if (!data || Object.keys(data).length === 0) return renderErrorPanel('No data available');

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