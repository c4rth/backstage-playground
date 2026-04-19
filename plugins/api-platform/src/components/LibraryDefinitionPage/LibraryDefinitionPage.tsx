import { useSearchParams } from 'react-router-dom';
import { LibraryOverviewDefinitionPage } from './LibraryOverviewDefinitionPage';
import { LibraryVersionDefinitionPage } from './LibraryVersionDefinitionPage';

export const LibraryDefinitionPage = () => {
  const [searchParams] = useSearchParams();
  const queryVersion = searchParams.get('version');

  return (
    <>
      {queryVersion ? (
        <LibraryVersionDefinitionPage />
      ) : (
        <LibraryOverviewDefinitionPage />
      )}
    </>
  );
};
