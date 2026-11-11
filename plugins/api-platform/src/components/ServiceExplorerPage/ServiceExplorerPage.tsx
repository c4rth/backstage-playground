import { ServiceTable } from '../ServiceTable';
import { useDocumentTitle } from '@internal/plugin-components-react';
import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-components-react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { apiPlatformTranslationRef } from '../../translation';
import { FullPage, PluginHeader } from '@backstage/ui';
import { RiCpuLine } from '@remixicon/react';

export const ServiceExplorerPage = () => {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  useDocumentTitle(t('serviceExplorer.documentTitle'));
  return (
    <>
      <PluginHeader
        title={t('serviceExplorer.title')}
        icon={<RiCpuLine fontSize="inherit" />}
        customActions={
          <InformationPopup
            content={
              <InformationPopupContent
                text={t('serviceExplorer.introduction')}
                comment={t('serviceExplorer.purpose')}
              />
            }
          />
        }
      />
      <FullPage>
        <ServiceTable />
      </FullPage>
    </>
  );
};
