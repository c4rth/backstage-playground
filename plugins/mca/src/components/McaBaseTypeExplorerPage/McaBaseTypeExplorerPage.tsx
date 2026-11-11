import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-components-react';
import { useDocumentTitle } from '@internal/plugin-components-react';
import { McaBaseTypeTable } from '../McaBaseTypeTable/McaBaseTypeTable';
import { Container, FullPage, PluginHeader } from '@backstage/ui';
import { RiAlbumLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { mcaTranslationRef } from '../../translation';

export const McaBaseTypeExplorerPage = () => {
  const { t } = useTranslationRef(mcaTranslationRef);
  useDocumentTitle(t('baseTypeExplorer.title'));
  return (
    <>
      <PluginHeader
        title={t('baseTypeExplorer.title')}
        icon={<RiAlbumLine fontSize="inherit" />}
        customActions={
          <InformationPopup
            content={
              <InformationPopupContent
                text={t('baseTypeExplorer.description')}
                comment={t('baseTypeExplorer.purpose')}
              />
            }
          />
        }
      />
      <FullPage>
        <Container>
          <McaBaseTypeTable />
        </Container>
      </FullPage>
    </>
  );
};
