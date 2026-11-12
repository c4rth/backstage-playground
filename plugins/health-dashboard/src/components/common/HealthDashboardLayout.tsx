import { ResponseErrorPanel } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { Box, Container, FullPage, Header } from '@backstage/ui';
import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-components-react';
import { Fragment, ReactNode } from 'react';
import { healthDashboardTranslationRef } from '../../translation';
import { HealthDataError } from '../../types';
import {
  HealthDetailsSelection,
  HealthDetailsSheet,
} from './HealthDetailsSheet';

type HealthDashboardLayoutProps = {
  title: string;
  description: string;
  statusDescription: string;
  actions: ReactNode;
  sourceErrors: HealthDataError[];
  spaceSourceErrors?: boolean;
  selection: HealthDetailsSelection | null;
  onCloseDetails: () => void;
  children: ReactNode;
};

export const HealthDashboardLayout = ({
  title,
  description,
  statusDescription,
  actions,
  sourceErrors,
  spaceSourceErrors,
  selection,
  onCloseDetails,
  children,
}: HealthDashboardLayoutProps) => {
  const { t } = useTranslationRef(healthDashboardTranslationRef);

  return (
    <FullPage>
      <Header
        title={title}
        sticky
        customActions={
          <>
            {actions}
            <InformationPopup
              content={
                <InformationPopupContent
                  text={description}
                  comment={statusDescription}
                />
              }
            />
          </>
        }
      />
      <Container
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {sourceErrors.map((sourceError, index) => {
          const error = (
            <ResponseErrorPanel
              title={t('dashboardCommon.sourceError', {
                source: sourceError.source,
              })}
              error={new Error(sourceError.message)}
            />
          );
          const key = `${sourceError.source}-${index}`;
          return spaceSourceErrors ? (
            <Box mb="4" key={key}>
              {error}
            </Box>
          ) : (
            <Fragment key={key}>{error}</Fragment>
          );
        })}
        {children}
      </Container>
      <HealthDetailsSheet selection={selection} onClose={onCloseDetails} />
    </FullPage>
  );
};

export const HealthDashboardEmptyState = () => {
  const { t } = useTranslationRef(healthDashboardTranslationRef);
  return (
    <div style={{ padding: 'var(--bui-space-4)', textAlign: 'center' }}>
      {t('dashboardCommon.emptyState')}
    </div>
  );
};
