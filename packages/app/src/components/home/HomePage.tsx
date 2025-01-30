import { Content, Page } from '@backstage/core-components';
import { HomePageRecentlyVisited, HomePageStarredEntities, HomePageToolkit, HomePageTopVisited, TemplateBackstageLogoIcon } from '@backstage/plugin-home';
import { HomePageSearchBar } from '@backstage/plugin-search';
import { SearchContextProvider } from '@backstage/plugin-search-react';
import { Grid, makeStyles } from '@material-ui/core';
import React from 'react';
import JiraIcon from '../icons/JiraIcon';
import ConfluenceIcon from '../icons/ConfluenceIcon';

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
    img: {
        height: '40px',
        width: 'auto',
    },
    notchedOutline: {
        borderStyle: 'none!important',
    },
}));

const tools = [
    { url: 'https://www.atlassian.com/software/jira', label: 'Jira', icon: <JiraIcon />, },
    { url: 'https://www.atlassian.com/software/confluence', label: 'Confluence', icon: <ConfluenceIcon />, },
    { url: 'https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md', label: 'Contributing', icon: <TemplateBackstageLogoIcon />, },
    { url: 'https://backstage.io/plugins', label: 'Plugins Directory', icon: <TemplateBackstageLogoIcon />, },
    { url: 'https://github.com/backstage/backstage/issues/new/choose', label: 'Submit New Issue', icon: <TemplateBackstageLogoIcon />, },
];

export const HomePage = () => {

    const classes = useStyles();

    return (
        <SearchContextProvider>
            <Page themeId="home">
                <Content>
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
                                <HomePageToolkit
                                    tools={tools} />
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