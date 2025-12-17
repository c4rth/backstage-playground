import {
  PageWithHeader,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { IFramePage } from '@internal/plugin-iframe';
import { useParams } from 'react-router-dom';
import { mcaComponentsBackendApiRef } from '../../api';
import { McaComponentsBackendApi } from '../../api/McaComponentsBackendApi';
import { useEffect, useState } from 'react';
import { McaBaseType } from '@internal/plugin-mca-common';

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
  const { name } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [baseType, setBaseType] = useState<McaBaseType>();

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
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [name, mcaApi]);

  let baseTypeUrl: string | undefined;
  if (baseType && baseTypesUrl) {
    const packageUrl = baseType.packageName?.replace(/\./g, '/') || '';
    baseTypeUrl = `${baseTypesUrl}/${packageUrl}/${baseType.baseType}.html`;
  }

  if (error) return <ResponseErrorPanel error={error} />;
  if (loading) return <Progress />;
  if (!baseTypesUrl) {
    return (
      <ResponseErrorPanel
        error={new Error('Base types URL not configured. Please check mcaComponents.baseTypes.baseUrl in app-config.yaml')}
      />
    );
  }

  return (
    <PageWithHeader
      key={name}
      themeId="apis"
      title={name || 'Unknown'}
      type='MCA BaseType'
    >
      <IFramePage 
        title={`BaseType :${baseTypeUrl}`}
        iframe={{
          src: baseTypeUrl || '',
          height: '100%',
          width: '100%',
        }}
      />
    </PageWithHeader>
  );
}