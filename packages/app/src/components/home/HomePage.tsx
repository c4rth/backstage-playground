import { Content, Page } from '@backstage/core-components';
import { HomePageCompanyLogo, HomePageRecentlyVisited, HomePageStarredEntities, HomePageToolkit, HomePageTopVisited, TemplateBackstageLogo, TemplateBackstageLogoIcon } from '@backstage/plugin-home';
import { HomePageSearchBar } from '@backstage/plugin-search';
import { SearchContextProvider } from '@backstage/plugin-search-react';
import { Grid, makeStyles } from '@material-ui/core';
import React from 'react';
import { QuestionTableCard } from '@drodil/backstage-plugin-qeta';

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
    }
}));

const useLogoStyles = makeStyles(theme => ({
    container: {
        margin: theme.spacing(5, 0),
    },
    svg: {
        width: 'auto',
        height: 100,
    },
    path: {
        fill: '#7df3e1',
    },
}));
/*
const tools = [
    {
        url: 'https://backstage.io/docs',
        label: 'Docs',
        icon: <TemplateBackstageLogoIcon />,
    },
    {
        url: 'https://github.com/backstage/backstage',
        label: 'GitHub',
        icon: <TemplateBackstageLogoIcon />,
    },
    {
        url: 'https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md',
        label: 'Contributing',
        icon: <TemplateBackstageLogoIcon />,
    },
    {
        url: 'https://backstage.io/plugins',
        label: 'Plugins Directory',
        icon: <TemplateBackstageLogoIcon />,
    },
    {
        url: 'https://github.com/backstage/backstage/issues/new/choose',
        label: 'Submit New Issue',
        icon: <TemplateBackstageLogoIcon />,
    },
];
*/

export const HomePage = () => {

    const classes = useStyles();
    const { svg, path, container } = useLogoStyles();

    return (
        <SearchContextProvider>
            <Page themeId="home">
                <Content>
                    <Grid container justifyContent="center" spacing={6}>
                        <HomePageCompanyLogo
                            className={container}
                            logo={<TemplateBackstageLogo classes={{ svg, path }} />}
                        />
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
                                    tools={Array(8).fill({
                                        url: '#',
                                        label: 'link',
                                        icon: <TemplateBackstageLogoIcon />,
                                    })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <QuestionTableCard />
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