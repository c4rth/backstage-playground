import { useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { coreApis } from '@backstage/frontend-plugin-api';

export const useDocumentTitle = (title: string) => {
  const appName =
    useApi(coreApis.config).getOptionalString('app.title') ?? 'Backstage';
  useEffect(() => {
    document.title = title ? `${title} | ${appName}` : appName;

    return () => {
      document.title = appName;
    };
  }, [title]);
};
