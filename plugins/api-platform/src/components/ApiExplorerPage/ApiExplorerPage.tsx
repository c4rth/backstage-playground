import { ApiTable } from '../ApiTable';
import { useDocumentTitle } from '@internal/plugin-components-react';
import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-components-react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { apiPlatformTranslationRef } from '../../translation';
import { FullPage, PluginHeader } from '@backstage/ui';
import { RiPuzzleFill } from '@remixicon/react';

export const ApiExplorerPage = () => {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  useDocumentTitle(t('apiExplorer.documentTitle'));
  return (
    <>
      <PluginHeader
        title={t('apiExplorer.title')}
        icon={<RiPuzzleFill fontSize="inherit" />}
        customActions={
          <InformationPopup
            content={
              <InformationPopupContent
                text={t('apiExplorer.introduction')}
                comment={t('apiExplorer.purpose')}
              />
            }
          />
        }
      />
      <FullPage>
        <ApiTable />
      </FullPage>
    </>
  );
};
