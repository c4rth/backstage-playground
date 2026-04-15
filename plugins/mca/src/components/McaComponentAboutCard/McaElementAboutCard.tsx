import { InfoCard, MarkdownContent } from "@backstage/core-components";
import { AboutField } from "@backstage/plugin-catalog";
import { Grid, Text } from "@backstage/ui";
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
    <InfoCard title='About' divider>
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
    </InfoCard>
  );
}