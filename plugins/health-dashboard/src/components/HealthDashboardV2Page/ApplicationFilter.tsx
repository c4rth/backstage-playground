import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { Select, Text } from '@backstage/ui';
import { useMemo } from 'react';
import { healthDashboardTranslationRef } from '../../translation';
import { HealthV2Data } from '../../types';
import { ALL_APPLICATIONS_ID } from './useApplicationFilter';

type ApplicationFilterProps = {
  healthData: HealthV2Data;
  selectedApplications: string[];
  onChange: (applications: string[]) => void;
};

export const ApplicationFilter = ({
  healthData,
  selectedApplications,
  onChange,
}: ApplicationFilterProps) => {
  const { t } = useTranslationRef(healthDashboardTranslationRef);
  const applicationOptions = useMemo(() => {
    const applications = new Set<string>();

    Object.values(healthData).forEach(groups => {
      Object.values(groups).forEach(group => {
        Object.values(group).forEach(probe => {
          applications.add(probe.application);
        });
      });
    });

    return [
      {
        label: t('dashboardV2Page.filters.allApplications'),
        id: ALL_APPLICATIONS_ID,
      },
      ...Array.from(applications)
        .sort((left, right) => left.localeCompare(right))
        .map(application => ({ label: application, id: application })),
    ];
  }, [healthData, t]);

  return (
    <>
      <Text>{t('dashboardV2Page.filters.applications')}</Text>
      <Select
        label=""
        search
        selectionMode="multiple"
        options={applicationOptions}
        value={
          selectedApplications.length
            ? selectedApplications
            : [ALL_APPLICATIONS_ID]
        }
        onChange={selected => {
          onChange(
            selected.includes(ALL_APPLICATIONS_ID) &&
              selectedApplications.length > 0
              ? []
              : selected
                  .map(String)
                  .filter(application => application !== ALL_APPLICATIONS_ID),
          );
        }}
        aria-label={t('dashboardV2Page.filters.applicationLabel')}
        style={{ minWidth: '150px' }}
      />
    </>
  );
};
