import { Content, PageWithHeader } from "@backstage/core-components";
import { TechDocsTable } from "../TechDocsTable";

export const TechDocsHome = () => {
  return (

<>
    <PageWithHeader
      themeId="documentation"
      title="Documentation"    >
      <Content>
        <TechDocsTable />
      </Content>
    </PageWithHeader>

    </>
  );
};