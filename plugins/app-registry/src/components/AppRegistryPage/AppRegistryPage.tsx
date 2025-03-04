import React from 'react';
import {
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { ComponentEntity } from "@backstage/catalog-model";
import { useEntity } from '@backstage/plugin-catalog-react';
import { useGetPolicies } from '../../hooks';
import { ANNOTATION_SERVICE_NAME, ANNOTATION_SERVICE_VERSION } from "@internal/plugin-api-platform-common";

export const AppRegistryPage = () => {

  const { entity } = useEntity<ComponentEntity>();

  const appCode = entity.spec.system;
  const appName = entity.metadata[ANNOTATION_SERVICE_NAME]?.toString();
  const appVersion = entity.metadata[ANNOTATION_SERVICE_VERSION]?.toString();
  const environment = entity.spec?.lifecycle.toUpperCase();

  console.log("Call getPolicies for: ", appCode, appName, appVersion, environment);

  const { data, loading, error } = useGetPolicies(appCode, appName, appVersion, environment);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <div>
      <h1>App Registry</h1>
      <h1>{JSON.stringify(data)}</h1>
    </div>
  );
};
