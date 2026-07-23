import {
  HomePageRecentlyVisited,
  HomePageStarredEntities,
  HomePageTopVisited,
} from '@backstage/plugin-home';
import { HomePageSearchBar } from '@backstage/plugin-search';
import { SearchContextProvider } from '@backstage/plugin-search-react';
import { ToolkitCard } from '@internal/plugin-toolkit';
import { Grid } from '@backstage/ui';
import { Content, Page } from '@backstage/core-components';

export const HomePage = () => {
  return (
    <SearchContextProvider>
      <Page themeId="home">
        <Content>
          <Grid.Root columns="12">
            <Grid.Item colSpan="12" style={{ margin: '16px' }}>
              <HomePageSearchBar placeholder="Search" />
            </Grid.Item>
            <Grid.Item colSpan="12">
              <Grid.Root columns="12">
                <Grid.Item colSpan="6">
                  <HomePageStarredEntities />
                </Grid.Item>
                <Grid.Item colSpan="6">
                  <ToolkitCard />
                </Grid.Item>
                <Grid.Item colSpan="6">
                  <HomePageRecentlyVisited />
                </Grid.Item>
                <Grid.Item colSpan="6">
                  <HomePageTopVisited />
                </Grid.Item>
              </Grid.Root>
            </Grid.Item>
          </Grid.Root>
        </Content>
      </Page>
    </SearchContextProvider>
  );
};
