import { CopyTextButton, MarkdownContent } from '@backstage/core-components';
import { AboutField } from '@backstage/plugin-catalog';
import { EntityInfoCard } from '@backstage/plugin-catalog-react';
import { Grid, Text, Link } from '@backstage/ui';
import { memo } from 'react';
import styles from './McaOperationAboutTab.module.css';
import { convertUrlLocation, UrlLocations } from './convertUrlLocations';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { mcaTranslationRef } from '../../translation';

const FieldDisplay = memo<{
  label: string;
  value:
    | string
    | number
    | boolean
    | { url: string; originalUrl?: string }
    | undefined;
  className: string;
  showCopyButton?: boolean;
}>(({ label, value, className, showCopyButton = false }) => {
  const { t } = useTranslationRef(mcaTranslationRef);
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
            <Link
              href={href}
              target="_blank"
              weight="bold"
              color="info"
              standalone
            >
              {String(displayValue)}
            </Link>
          ) : (
            String(displayValue)
          )}
        </Text>
        {showCopyButton && copyValue && copyValue !== '-' && (
          <CopyTextButton text={copyValue} />
        )}
        {originalUrl && originalUrl !== displayValue && (
          <>
            <br />
            <Text
              variant="body-small"
              style={{ fontSize: '0.85em', color: 'gray' }}
            >
              {t('operationAbout.originalUrl', { url: originalUrl })}
            </Text>
          </>
        )}
      </AboutField>
    </Grid.Item>
  );
});

export interface McaOperationAboutTabProps {
  operationAnalyze: any;
  operation: any;
  urlLocations: UrlLocations;
}

export const McaOperationAboutTab = memo<McaOperationAboutTabProps>(
  ({ operationAnalyze, operation, urlLocations }) => {
    const { t } = useTranslationRef(mcaTranslationRef);
    const fieldConfigs = [
      {
        label: t('operationAbout.package'),
        value: operationAnalyze?.package,
        xs: 6,
      },
      {
        label: t('operationAbout.extends'),
        value: operationAnalyze?.type,
        xs: 6,
      },
      {
        label: t('operationAbout.version'),
        value: operationAnalyze?.version,
        xs: 6,
      },
      {
        label: t('operationAbout.type'),
        value: operationAnalyze?.cobolName,
        xs: 6,
      },
      {
        label: t('operationAbout.flowController'),
        value: operationAnalyze?.flowControlerName,
        xs: 6,
      },
      { label: t('operationAbout.bs'), value: operationAnalyze?.bsName, xs: 6 },
      {
        label: t('operationAbout.bFunction'),
        value: operationAnalyze?.bfunction,
        xs: 12,
      },
      {
        label: t('operationAbout.fic'),
        value: convertUrlLocation(operationAnalyze?.ficLocation, urlLocations),
        xs: 12,
        showCopyButton: Boolean(operationAnalyze?.ficLocation),
      },
      {
        label: t('operationAbout.tic'),
        value: convertUrlLocation(operationAnalyze?.ticLocation, urlLocations),
        xs: 12,
        showCopyButton: Boolean(operationAnalyze?.ticLocation),
      },
      {
        label: t('operationAbout.cic'),
        value: convertUrlLocation(operationAnalyze?.cicLocation, urlLocations),
        xs: 12,
        showCopyButton: Boolean(operationAnalyze?.cicLocation),
      },
      {
        label: t('operationAbout.caching'),
        value: operation?.useCache
          ? t('operationAbout.cacheEnabled')
          : t('operationAbout.cacheDisabled'),
        xs: 12,
      },
    ];

    return (
      <EntityInfoCard title={t('operationAbout.title')}>
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
            <AboutField label={t('operationAbout.description')}>
              <MarkdownContent content={operationAnalyze?.description || ''} />
            </AboutField>
          </Grid.Item>
        </Grid.Root>
      </EntityInfoCard>
    );
  },
);
