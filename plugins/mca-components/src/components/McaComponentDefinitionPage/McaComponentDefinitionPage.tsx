import {
  Content,
  PageWithHeader,
  Progress,
  ResponseErrorPanel,
  Select,
  SelectItem,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useEffect, useRef, useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import { useParams, useSearchParams } from 'react-router-dom';
import { McaComponent } from '@internal/plugin-mca-components-common';
import { McaComponentDefinitionCard } from './McaComponentDefinitionCard';
import { useGetMcaComponent } from '../../hooks';

type McaComponentVersion = {
  label: string;
  value: string;
};

function mapMcaVersions(mca: McaComponent | undefined): McaComponentVersion[] {
  if (!mca) {
    return [];
  }
  const versions: McaComponentVersion[] = [];
  if (mca.p4Version) {
    versions.push({ label: mca.p4Version, value: mca.p4Version });
  }
  if (mca.p3Version) {
    versions.push({ label: mca.p3Version, value: mca.p3Version });
  }
  if (mca.p2Version) {
    versions.push({ label: mca.p2Version, value: mca.p2Version });
  }
  if (mca.p1Version) {
    versions.push({ label: mca.p1Version, value: mca.p1Version });
  }
  if (mca.prdVersion) {
    versions.push({ label: `${mca.prdVersion} (PRD)`, value: mca.prdVersion });
  }
  return versions;
}

export const McaComponentDefinitionPage = () => {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const queryVersion = searchParams.get('version');

  const { mca, loading, error } = useGetMcaComponent(name!);

  const [versions, setVersions] = useState<SelectItem[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);

  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!selectedVersion) {
      const mcaVersions = mapMcaVersions(mca);
      const data = mcaVersions
        ? mcaVersions.map(mcaVersion => ({ label: mcaVersion.label, value: mcaVersion.value }))
        : []
      setVersions(data);
      let selVersion = null;
      if (isInitialLoad.current && queryVersion && data.some(item => item.value === queryVersion)) {
        selVersion = data.find(item => item.value === queryVersion)?.value;
        isInitialLoad.current = false;
      } else if (data.length > 0) {
        selVersion = data[0].value;
      }
      if (selVersion) {
        setSelectedVersion(selVersion);
      }
    }
  }, [mca, queryVersion, selectedVersion])

  const configApi = useApi(configApiRef);
  const generatedSubtitle = `${configApi.getOptionalString('organization.name') ?? 'Backstage'} MCA Component Explorer`;

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (loading) {
    return <Progress />
  }

  return (
    <PageWithHeader
      themeId="apis"
      title={`MCA Component - ${name}`}
      subtitle={generatedSubtitle}>
      <Content>
        <Box mb={1}>
          <Grid container>
            <Grid item md={6}>
              <Select onChange={(selected) => { setSelectedVersion(selected.toString()) }} label="Versions" items={versions} selected={selectedVersion} />
            </Grid>
          </Grid>
        </Box>

        <Box mb={-3}>
          {mca ?
            <McaComponentDefinitionCard mca={mca} version={selectedVersion!} />
            : <div />
          }
        </Box>
      </Content>
    </PageWithHeader>
  );

};