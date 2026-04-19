import { Content, Header, Page } from '@backstage/core-components';
import {
  HomePageRecentlyVisited,
  HomePageStarredEntities,
  HomePageTopVisited,
  WelcomeTitle,
} from '@backstage/plugin-home';
import { HomePageSearchBar } from '@backstage/plugin-search';
import { SearchContextProvider } from '@backstage/plugin-search-react';
import { ToolkitCard } from '@internal/plugin-toolkit';
import { Box, Grid } from '@backstage/ui';
import styles from './HomePage.module.css';

export const HomePage = () => {
  return (
    <SearchContextProvider>
      <Page themeId="home">
        <Content>
          <Box>
            <Header title={<WelcomeTitle />} pageTitleOverride="Home" />
          </Box>
          <Grid.Root columns="12">
            <Grid.Item colSpan="12" style={{ margin: '16px' }}>
              <HomePageSearchBar
                InputProps={{
                  classes: {
                    root: styles.searchBarInput,
                    notchedOutline: styles.searchBarOutline,
                  },
                }}
                placeholder="Search"
              />
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
