import {
  HomePageRecentlyVisited,
  HomePageStarredEntities,
  HomePageTopVisited,
} from '@backstage/plugin-home';
import { HomePageSearchBar } from '@backstage/plugin-search';
import { SearchContextProvider } from '@backstage/plugin-search-react';
import { Container, FullPage, Grid } from '@backstage/ui';
import { ToolkitCard } from '@internal/plugin-toolkit';

const searchBarClasses = {
  root: 'searchBarRoot',
  notchedOutline: 'searchBarOutline',
};

export const HomePage = () => {
  return (
    <SearchContextProvider>
      <style>{`
        .searchBarRoot {
          max-width: 60vw;
          margin: auto;
          background-color: var(--bui-bg-neutral-1);
          border-radius: 50px;
          box-shadow: var(--bui-shadow);
        }

        .searchBarOutline {
          border-style: none;
        }
      `}</style>
      <FullPage>
        <Container>
          <Grid.Root columns="12">
            <Grid.Item colSpan="12" style={{ margin: '16px' }}>
              <HomePageSearchBar
                InputProps={{
                  classes: searchBarClasses,
                }}
                placeholder="Search"
              />
            </Grid.Item>
            <Grid.Item colSpan="12">
              <Grid.Root columns="12">
                <Grid.Item colSpan="6">
                  <HomePageStarredEntities groupByKind />
                </Grid.Item>
                <Grid.Item colSpan="6">
                  <ToolkitCard />
                </Grid.Item>
                <Grid.Item colSpan="6">
                  <HomePageRecentlyVisited
                    numVisitsOpen={10}
                    numVisitsTotal={20}
                  />
                </Grid.Item>
                <Grid.Item colSpan="6">
                  <HomePageTopVisited numVisitsOpen={10} numVisitsTotal={20} />
                </Grid.Item>
              </Grid.Root>
            </Grid.Item>
          </Grid.Root>
        </Container>
      </FullPage>
    </SearchContextProvider>
  );
};
