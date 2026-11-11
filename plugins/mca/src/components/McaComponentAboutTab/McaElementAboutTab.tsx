import { MarkdownContent } from '@backstage/core-components';
import { EntityInfoCard } from '@backstage/plugin-catalog-react';
import { AboutField } from '@backstage/plugin-catalog';
import { Grid, Text } from '@backstage/ui';
import { memo } from 'react';
import styles from './McaElementAboutTab.module.css';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { mcaTranslationRef } from '../../translation';

export interface McaElementAboutTabProps {
  element: any;
}

const FieldDisplay = memo<{
  label: string;
  value: string | undefined;
  className: string;
}>(({ label, value, className }) => (
  <AboutField label={label}>
    <Text
      variant="body-medium"
      className={className}
      style={{ display: 'inline' }}
    >
      {value || '-'}
    </Text>
  </AboutField>
));

export const McaElementAboutTab = ({ element }: McaElementAboutTabProps) => {
  const { t } = useTranslationRef(mcaTranslationRef);
  const fieldConfigs = [
    {
      label: t('elementAbout.package'),
      value: element?.package,
    },
    {
      label: t('elementAbout.extends'),
      value: element?.superClass,
    },
  ];

  return (
    <EntityInfoCard title={t('elementAbout.title')}>
      <Grid.Root columns="1">
        {fieldConfigs.map(config => (
          <FieldDisplay
            key={config.label}
            label={config.label}
            value={config.value}
            className={styles.value}
          />
        ))}
        <AboutField label={t('elementAbout.description')}>
          <MarkdownContent content={element?.description || ''} />
        </AboutField>
      </Grid.Root>
    </EntityInfoCard>
  );
};
