import { MarkdownContent } from "@backstage/core-components";
import { AboutField } from "@backstage/plugin-catalog";
import { Card, CardBody, CardHeader, Grid, Text } from "@backstage/ui";
import { Divider } from "@internal/plugin-api-platform-react";
import { useMemo, memo } from 'react';
import styles from './McaElementAboutCard.module.css';

export interface McaElementAboutCardProps {
  element: any;
}

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
    <Card className={styles.gridItemCard}>
      <CardHeader style={{ margin: '0.5rem' }}><Text variant='title-small'><b>About</b></Text></CardHeader>
      <Divider />
      <CardBody className={styles.gridItemCardContent} style={{ margin: '0.5rem' }}>
        <Grid.Root columns='1'>
          {fieldConfigs.map((config) => (
            <FieldDisplay
              key={config.label}
              label={config.label}
              value={config.value}
              className={styles.value}
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