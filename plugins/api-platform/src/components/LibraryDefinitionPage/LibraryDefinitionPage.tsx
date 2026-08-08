import { useRouteRefParams } from '@backstage/frontend-plugin-api';
import { useSearchParams } from 'react-router-dom';
import { apiPlatformLibraryDefinitionRouteRef } from '../../routes';
import { LibraryDefinitionDetailPage } from './LibraryDefinitionDetailPage';
import { LibraryDefinitionVersionsPage } from './LibraryDefintionVersionsPage';

export const LibraryDefinitionPage = () => {
  
  const { system, name } = useRouteRefParams(apiPlatformLibraryDefinitionRouteRef);
  const [searchParams] = useSearchParams();
  const queryVersion = searchParams.get('version');

  return queryVersion ? (
    <LibraryDefinitionDetailPage system={system!} name={name!} version={queryVersion} />
  ) : (
    <LibraryDefinitionVersionsPage system={system!} name={name!} />
  );
}
