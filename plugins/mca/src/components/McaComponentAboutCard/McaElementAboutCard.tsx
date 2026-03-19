import { MarkdownContent } from "@backstage/core-components";
import { AboutField } from "@backstage/plugin-catalog";
import { Card, CardBody, CardHeader, Grid, Text } from "@backstage/ui";
import { Divider } from "@internal/plugin-api-platform-react";
import { memo } from 'react';
import styles from './McaElementAboutCard.module.css';

export interface McaElementAboutCardProps {
  element: any;
}

const FieldDisplay = memo<{
  label: string;
  value: string | undefined;
  className: string;
}>(({ label, value, className }) => (
  <AboutField label={label}>
    <Text variant="body-medium" className={className} style={{ display: 'inline' }}>
      {value || '-'}
    </Text>
  </AboutField>
));


export const McaElementAboutCard = ({ element }: McaElementAboutCardProps) => {
  const fieldConfigs = [
    {
      label: "Package",
      value: element?.package,
    },
    {
      label: "Extends",
      value: element?.superClass,
    },
  ];

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
            />
          ))}
          <AboutField label="Description">
            <MarkdownContent content={element?.description || ''} />
          </AboutField>
        </Grid.Root>
      </CardBody>
    </Card>
  );
}