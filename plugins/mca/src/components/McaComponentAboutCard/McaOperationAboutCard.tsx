import {
  CopyTextButton,
  InfoCard,
  MarkdownContent,
  Link
} from '@backstage/core-components';
import { AboutField } from '@backstage/plugin-catalog';
import { Grid, Text } from '@backstage/ui';
import { memo } from 'react';
import styles from './McaOperationAboutCard.module.css';

export type UrlLocations = {
  oldDns: string;
  newDns: string;
};

const FieldDisplay = memo<{
  label: string;
  value: string | number | boolean | { url: string; originalUrl?: string } | undefined;
  className: string;
  showCopyButton?: boolean;
}>(({ label, value, className, showCopyButton = false }) => {
  let displayValue: string | number | boolean = '-';
  let isLink = false;
  let href = '';
  let copyValue = '';
  let originalUrl: string | undefined = undefined;

  if (value !== undefined && value !== null) {
    if (typeof value === 'object' && 'url' in value) {
      displayValue = value.url;
      originalUrl = value.originalUrl;
      copyValue = value.url;
      if (typeof value.url === 'string' && value.url.startsWith('https://')) {
        isLink = true;
        href = value.url;
      }
    } else {
      displayValue = value;
      copyValue = String(value);
      if (typeof value === 'string' && value.startsWith('https://')) {
        isLink = true;
        href = value;
      }
    }
  }

  return (
    <Grid.Item>
      <AboutField label={label}>
        <Text
          variant="body-medium"
          className={className}
          style={{ display: 'inline' }}
        >
          {isLink ? (
            <Link to={href} target="_blank">
              {String(displayValue)}
            </Link>
          ) : (
            String(displayValue)
          )}
        </Text>
        {showCopyButton && copyValue && copyValue !== '-' && <CopyTextButton text={copyValue} />}
        {originalUrl && originalUrl !== displayValue && (
          <>
          <br/>
          <Text
            variant="body-small"
            style={{ fontSize: '0.85em', color: 'gray' }}
          >
            original: {originalUrl}
          </Text>
          </>
        )}
      </AboutField>
    </Grid.Item>
  );
});

function getDecodedURI(
  url: string | undefined,
  urlLocations: UrlLocations,
): { url: string; originalUrl?: string } {
  if (!url) {
    return { url: '-' };
  }
  if (url.startsWith(urlLocations.oldDns)) {
    return {
      url: url.replace(urlLocations.oldDns, urlLocations.newDns),
      originalUrl: url,
    };
  }
  return { url };
}

export interface McaOperationAboutCardProps {
  operationAnalyze: any;
  operation: any;
  urlLocations: UrlLocations;
}

export const McaOperationAboutCard = memo<McaOperationAboutCardProps>(
  ({ operationAnalyze, operation, urlLocations }) => {
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
        value: getDecodedURI(operationAnalyze?.ficLocation, urlLocations),
        xs: 12,
        showCopyButton: Boolean(operationAnalyze?.ficLocation),
      },
      {
        label: 'TIC',
        value: getDecodedURI(operationAnalyze?.ticLocation, urlLocations),
        xs: 12,
        showCopyButton: Boolean(operationAnalyze?.ticLocation),
      },
      {
        label: 'CIC',
        value: getDecodedURI(operationAnalyze?.cicLocation, urlLocations),
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
