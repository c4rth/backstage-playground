import { Content, Header, Page } from '@backstage/core-components';
import { HomePageRecentlyVisited, HomePageStarredEntities, HomePageTopVisited, WelcomeTitle } from '@backstage/plugin-home';
import { HomePageSearchBar } from '@backstage/plugin-search';
import { SearchContextProvider } from '@backstage/plugin-search-react';
import { ToolkitCard } from '@internal/plugin-api-platform';
import { Box, Grid, makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
    searchBarInput: {
        maxWidth: '60vw',
        margin: 'auto',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '50px',
        boxShadow: theme.shadows[1],
    },
    searchBarOutline: {
        borderStyle: 'none'
    },
}));


export const HomePage = () => {

    const classes = useStyles();

    return (
        <SearchContextProvider>
            <Page themeId="home">
                <Content>
                    <Box mb={3}>
                        <Header title={<WelcomeTitle />} pageTitleOverride='Home' />
                    </Box>
                    <Grid container justifyContent="center" spacing={6}>
                        <Grid container item xs={12} justifyContent='center'>
                            <HomePageSearchBar
                                InputProps={{ classes: { root: classes.searchBarInput, notchedOutline: classes.searchBarOutline } }}
                                placeholder="Search"
                            />
                        </Grid>
                        <Grid container item xs={12}>
                            <Grid item xs={12} md={6}>
                                <HomePageStarredEntities />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <ToolkitCard />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <HomePageRecentlyVisited />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <HomePageTopVisited />
                            </Grid>
                        </Grid>
                    </Grid>
                </Content>
            </Page>
        </SearchContextProvider>
    );
};