import { SystemTable } from '../SystemTable';
import { useDocumentTitle } from '@internal/plugin-components-react';
import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-components-react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { apiPlatformTranslationRef } from '../../translation';
import { FullPage, PluginHeader } from '@backstage/ui';

export const SystemExplorerPage = () => {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  useDocumentTitle(t('systemExplorer.documentTitle'));
  return (
    <>
      <PluginHeader
        title={t('systemExplorer.title')}
        customActions={
          <InformationPopup
            content={
              <InformationPopupContent
                text={t('systemExplorer.introduction')}
                comment={t('systemExplorer.purpose')}
              />
            }
          />
        }
      />
      <FullPage>
        <SystemTable />
      </FullPage>
    </>
  );
};
