import { ResponseErrorPanel } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { mcaComponentsBackendApiRef } from '../../api';
import { McaComponentsBackendApi } from '../../api/McaComponentsBackendApi';
import { useEffect, useState } from 'react';
import { McaBaseType } from '@internal/plugin-mca-common';
import { FullPage, PluginHeader } from '@backstage/ui';
import { Progress } from '@internal/plugin-components-react';
import { useRouteRefParams } from '@backstage/frontend-plugin-api';
import { baseTypeRouteRef } from '../../routes';

async function getBaseType(
  mcaApi: McaComponentsBackendApi,
  name: string,
): Promise<McaBaseType> {
  const mca = await mcaApi.getMcaBaseType(name);
  if (!mca) {
    throw new Error(`MCA basetype ${name} not found`);
  }
  return mca;
}

export const McaBaseTypeDefinitionPage = () => {
  const mcaApi = useApi(mcaComponentsBackendApiRef);
  const configApi = useApi(configApiRef);
  const { name } = useRouteRefParams(baseTypeRouteRef);

  const [error, setError] = useState<Error | null>(null);
  const [baseType, setBaseType] = useState<McaBaseType>();
  const [iframeLoading, setIframeLoading] = useState(true);

  let baseTypesUrl = '';
  try {
    baseTypesUrl = configApi.getString('mcaComponents.baseTypes.baseUrl');
  } catch (configError) {
    // baseTypesUrl remains empty
  }

  useEffect(() => {
    getBaseType(mcaApi, name!)
      .then(result => {
        setBaseType(result);
      })
      .catch(err => {
        setError(err);
      });
  }, [name, mcaApi]);

  let baseTypeUrl: string | undefined;
  if (baseType && baseTypesUrl) {
    const packageUrl = baseType.packageName?.replace(/\./g, '/') || '';
    baseTypeUrl = `${baseTypesUrl}/${packageUrl}/${baseType.baseType}.html`;
  }

  useEffect(() => {
    setIframeLoading(true);
  }, [baseTypeUrl]);

  if (error) return <ResponseErrorPanel error={error} />;
  if (!baseTypesUrl) {
    return (
      <ResponseErrorPanel
        error={
          new Error(
            'Base types URL not configured. Please check mcaComponents.baseTypes.baseUrl in app-config.yaml',
          )
        }
      />
    );
  }

  return (
    <>
      <PluginHeader title={`BaseType: ${name}`} />
      <FullPage>
        {iframeLoading && <Progress />}
        <iframe
          src={baseTypeUrl || ''}
          height={iframeLoading ? 0 : '100%'}
          width={iframeLoading ? 0 : '100%'}
          style={{ border: 0, visibility: iframeLoading ? 'hidden' : 'visible' }}
          title={`BaseType :${baseTypeUrl}`}
          onLoad={() => setIframeLoading(false)}
        />
      </FullPage>
    </>
  );
};
