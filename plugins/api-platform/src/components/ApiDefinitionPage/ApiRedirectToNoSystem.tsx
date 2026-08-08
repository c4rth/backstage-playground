import { API_NO_SYSTEM } from '@internal/plugin-api-platform-common';
import { Navigate } from 'react-router-dom';
import { useRouteRefParams } from '@backstage/frontend-plugin-api';
import { apiPlatformApiNoSystemRouteRef } from '../../routes';

export const ApiRedirectToNoSystem = () => {
  const { name } = useRouteRefParams(apiPlatformApiNoSystemRouteRef);
  return <Navigate to={`/api-platform/api/${API_NO_SYSTEM}/${name}`} replace />;
};
