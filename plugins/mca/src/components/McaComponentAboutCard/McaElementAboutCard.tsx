import { MarkdownContent } from "@backstage/core-components";
import { AboutField } from "@backstage/plugin-catalog";
import { Card, CardBody, CardHeader, Grid, Text } from "@backstage/ui";
import { Divider } from "@internal/plugin-api-platform-react";
import { makeStyles, Theme } from "@material-ui/core";
import { useMemo, memo } from 'react';

export interface McaElementAboutCardProps {
  element: any;
}

const useStyles = makeStyles(
  (theme: Theme) => ({
    gridItemCard: {
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100% - 10px)', // for pages without content header
      marginBottom: '10px',
    },
    infoCardHeader: {
      padding: '16px',
    },
    gridItemCardContent: {
      flex: 1,
    },
    value: {
      fontWeight: 'bold',
      overflow: 'hidden',
      lineHeight: '24px',
      wordBreak: 'break-word',
    },
    label: {
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
      fontSize: '10px',
      fontWeight: 'bold',
      letterSpacing: 0.5,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
  }),
);

const FieldDisplay = memo<{
  label: string;
  value: string | undefined;
  className: string;
  gridSizes?: { xs?: number; sm?: number; lg?: number };
}>(({ label, value, className, gridSizes = { xs: 12, sm: 6, lg: 6 } }) => (
  <AboutField label={label} gridSizes={gridSizes}>    
    <Text variant="body-medium" className={className} style={{ display: 'inline'}}>
      {value || '-'}
    </Text>
  </AboutField>
));


export const McaElementAboutCard = ({ element }: McaElementAboutCardProps) => {
  const classes = useStyles();
  const fieldValues = useMemo(() => ({
    package: element?.package,
    superClass: element?.superClass,
    description: element?.description || '',
  }), [element?.package, element?.superClass, element?.description]);

  const fieldConfigs = useMemo(() => [
    {
      label: "Package",
      value: fieldValues.package,
      gridSizes: { xs: 12, sm: 6, lg: 6 }
    },
    {
      label: "Extends",
      value: fieldValues.superClass,
      gridSizes: { xs: 12, sm: 6, lg: 6 }
    },
  ], [fieldValues.package, fieldValues.superClass]);

  const descriptionGridSizes = useMemo(() => ({
    xs: 12,
    sm: 6,
    lg: 12
  }), []);

  return (
    <Card className={classes.gridItemCard}>
      <CardHeader style={{ margin: '0.5rem' }}><Text variant='title-small'><b>About</b></Text></CardHeader>
      <Divider />
      <CardBody className={classes.gridItemCardContent} style={{ margin: '0.5rem' }}>
        <Grid.Root columns='1'>
          {fieldConfigs.map((config) => (
            <FieldDisplay
              key={config.label}
              label={config.label}
              value={config.value}
              className={classes.value}
              gridSizes={config.gridSizes}
            />
          ))}
          <AboutField label="Description" gridSizes={descriptionGridSizes}>
            <MarkdownContent content={fieldValues.description} />
          </AboutField>
        </Grid.Root>
      </CardBody>
    </Card>
  );
}