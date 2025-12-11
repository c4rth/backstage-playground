import { useSearchParams } from 'react-router-dom';
import { LibraryOverviewDefinitionCard } from './LibraryOverviewDefinitionCard';
import { LibraryVersionDefinitionCard } from './LibraryVersionDefinitionCard';

export const LibraryDefinitionPage = () => {
  const [searchParams] = useSearchParams();
  const queryVersion = searchParams.get('version');

  return (
    <>
      {queryVersion ?
        (
          <LibraryVersionDefinitionCard />
        ) :
        (
          <LibraryOverviewDefinitionCard />
        )
      }
    </>
  );
};