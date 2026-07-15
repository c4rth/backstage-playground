import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-api-platform-react';
import { McaBaseTypeTable } from '../McaBaseTypeTable/McaBaseTypeTable';
import { Container, FullPage, PluginHeader } from '@backstage/ui';
import { RiAlbumLine } from '@remixicon/react';

const POPUP_CONTENT = (
  <InformationPopupContent
    text1="Explore all MCA base type definitions registered in Backstage. This screen provides a searchable and filterable table of base types, including their names and associated packages. Use this view to quickly find, review, and navigate to detailed information about each base type in your platform."
    text2="The MCA BaseType Explorer helps you maintain visibility and control over your organization's base types, making it easy to discover, document, and govern your technical building blocks."
  />
);

export const McaBaseTypeExplorerPage = () => {
  return (
    <>
      <PluginHeader
        title="MCA BaseTypes"
        icon={<RiAlbumLine fontSize="inherit" />}
        customActions={<InformationPopup content={POPUP_CONTENT} />} />
      <FullPage>
        <Container>
          <McaBaseTypeTable />
        </Container>
      </FullPage>
    </>
  );
};
