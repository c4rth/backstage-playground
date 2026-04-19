import {
  CopyTextButton,
  InfoCard,
  MarkdownContent,
} from '@backstage/core-components';
import { AboutField } from '@backstage/plugin-catalog';
import { Grid, Text } from '@backstage/ui';
import { memo } from 'react';
import styles from './McaOperationAboutCard.module.css';

const FieldDisplay = memo<{
  label: string;
  value: string | undefined;
  className: string;
  showCopyButton?: boolean;
}>(({ label, value, className, showCopyButton = false }) => (
  <Grid.Item>
    <AboutField label={label}>
      <Text
        variant="body-medium"
        className={className}
        style={{ display: 'inline' }}
      >
        {value || '-'}
      </Text>
      {showCopyButton && value && <CopyTextButton text={value} />}
    </AboutField>
  </Grid.Item>
));

function getDecodedURI(url: string | undefined): string {
  if (!url) {
    return '-';
  }
  return url;
}

export interface McaOperationAboutCardProps {
  operationAnalyze: any;
  operation: any;
}

export const McaOperationAboutCard = memo<McaOperationAboutCardProps>(
  ({ operationAnalyze, operation }) => {
    const fieldConfigs = [
      { label: 'Package', value: operationAnalyze?.package, xs: 6 },
      { label: 'Extends', value: operationAnalyze?.type, xs: 6 },
      { label: 'Operation Version', value: operationAnalyze?.version, xs: 6 },
      { label: 'Operation Type', value: operationAnalyze?.cobolName, xs: 6 },
      {
        label: 'Flow Controller',
        value: operationAnalyze?.flowControlerName,
        xs: 6,
      },
      { label: 'BS', value: operationAnalyze?.bsName, xs: 6 },
      { label: 'B-Function', value: operationAnalyze?.bfunction, xs: 12 },
      {
        label: 'FIC',
        value: getDecodedURI(operationAnalyze?.ficLocation),
        xs: 12,
        showCopyButton: Boolean(operationAnalyze?.ficLocation),
      },
      {
        label: 'TIC',
        value: getDecodedURI(operationAnalyze?.ticLocation),
        xs: 12,
        showCopyButton: Boolean(operationAnalyze?.ticLocation),
      },
      {
        label: 'CIC',
        value: getDecodedURI(operationAnalyze?.cicLocation),
        xs: 12,
        showCopyButton: Boolean(operationAnalyze?.cicLocation),
      },
      {
        label: 'Caching',
        value: operation?.useCache ? 'TRUE' : 'FALSE',
        xs: 12,
      },
    ];

    return (
      <InfoCard title="About" divider>
        <Grid.Root columns="1">
          {fieldConfigs.map(config => (
            <FieldDisplay
              key={config.label}
              label={config.label}
              value={config.value}
              className={styles.value}
              showCopyButton={config.showCopyButton}
            />
          ))}
          <Grid.Item>
            <AboutField label="Description">
              <MarkdownContent content={operationAnalyze?.description || ''} />
            </AboutField>
          </Grid.Item>
        </Grid.Root>
      </InfoCard>
    );
  },
);
