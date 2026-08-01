import {
  HomePageRecentlyVisited,
  HomePageStarredEntities,
  HomePageTopVisited,
} from '@backstage/plugin-home';
import { HomePageSearchBar } from '@backstage/plugin-search';
import { SearchContextProvider } from '@backstage/plugin-search-react';
import { Container, FullPage, Grid } from '@backstage/ui';
import { ToolkitCard } from '@internal/plugin-toolkit';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  searchBarInput: {
    maxWidth: '60vw',
    margin: 'auto',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '50px',
    boxShadow: theme.shadows[1],
  },
  searchBarOutline: {
    borderStyle: 'none',
  },
}));

export const HomePage = () => {
  const classes = useStyles();
  return (
    <SearchContextProvider>
      <FullPage>
        <Container>
          <Grid.Root columns="12">
            <Grid.Item colSpan="12" style={{ margin: '16px' }}>
              <HomePageSearchBar
                InputProps={{
                  classes: {
                    root: classes.searchBarInput,
                    notchedOutline: classes.searchBarOutline,
                  },
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
                  <HomePageRecentlyVisited numVisitsOpen={10} numVisitsTotal={20} />
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
