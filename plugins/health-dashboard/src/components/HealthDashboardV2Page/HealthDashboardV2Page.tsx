import { ResponseErrorPanel } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { Flex } from '@backstage/ui';
import { Progress, useDocumentTitle } from '@internal/plugin-components-react';
import { useCallback, useState } from 'react';
import { healthDashboardTranslationRef } from '../../translation';
import {
  HealthDashboardLayout,
  HealthDetailsSelection,
  RefreshControls,
} from '../common';
import { ApplicationFilter } from './ApplicationFilter';
import { HealthV2MatrixRow } from './healthMatrix';
import { HealthMatrixTable } from './HealthMatrixTable';
import { useApplicationFilter } from './useApplicationFilter';
import { useHealthDashboardV2Data } from './useHealthDashboardV2Data';

export const HealthDashboardV2Page = () => {
  const { t } = useTranslationRef(healthDashboardTranslationRef);
  useDocumentTitle(t('dashboardV2Page.title'));

  const { healthData, healthDataErrors, loadError, isLoading, reload } =
    useHealthDashboardV2Data();
  const {
    selectedApplications,
    expandedApplications,
    updateApplications,
    toggleApplication,
  } = useApplicationFilter();
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<HealthDetailsSelection | null>(null);

  const handleEnvironmentSelect = useCallback(
    (row: HealthV2MatrixRow, environment: string) => {
      const probes = row.environments[environment];
      if (probes?.length) {
        setSelectedEnvironment({
          title: t('dashboardV2Page.details.title', {
            application: row.application,
            component: row.component ?? '?',
            environment,
          }),
          sections: probes.map((probe, index) => ({
            id: `${probe.healthProbeUrl}-${index}`,
            fields: Object.entries(probe).map(([label, value]) => ({
              label,
              value,
            })),
          })),
        });
      }
    },
    [t],
  );

  return (
    <HealthDashboardLayout
      title={t('dashboardV2Page.title')}
      description={t('dashboardV2Page.description')}
      statusDescription={t('dashboardV2Page.statusDescription')}
      sourceErrors={healthDataErrors}
      selection={selectedEnvironment}
      onCloseDetails={() => setSelectedEnvironment(null)}
      actions={
        <Flex style={{ alignItems: 'center' }}>
          <ApplicationFilter
            healthData={healthData}
            selectedApplications={selectedApplications}
            onChange={updateApplications}
          />
          <RefreshControls onRefresh={reload} isDisabled={isLoading} />
        </Flex>
      }
    >
      {loadError && (
        <ResponseErrorPanel
          title={t('dashboardV2Page.errors.load')}
          error={loadError}
        />
      )}
      {isLoading ? (
        <Progress />
      ) : (
        <HealthMatrixTable
          healthData={healthData}
          selectedApplications={selectedApplications}
          expandedApplications={expandedApplications}
          onToggleApplication={toggleApplication}
          onSelectEnvironment={handleEnvironmentSelect}
        />
      )}
    </HealthDashboardLayout>
  );
};
