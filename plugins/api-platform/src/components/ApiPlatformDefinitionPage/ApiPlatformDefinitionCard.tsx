import {
    CodeSnippet,
    InfoCard,
    TabbedLayout,
} from '@backstage/core-components';
import { ApiEntity } from "@backstage/catalog-model"
import React from 'react';
import { PlainApiDefinitionWidget } from '@backstage/plugin-api-docs';
import { Box, Grid, makeStyles, Theme } from '@material-ui/core';
import { EntityRefLink, useEntity } from '@backstage/plugin-catalog-react';
import { AboutContent, AboutField } from '@backstage/plugin-catalog';
import { Link } from 'react-router-dom';
import CloudCircleIcon from '@material-ui/icons/CloudCircle';
import { ANNOTATION_API_NAME, ANNOTATION_API_PROJECT, ANNOTATION_API_VERSION } from '@internal/plugin-api-platform-common';
// Spectral 
import { EntityApiDocsSpectralLinterCard } from '../EntityApiDocsSpectralLinterContent';
import { isApiDocsSpectralLinterAvailable } from '../../lib/helper';
import { ApiPlatformRelationCard } from './ApiPlatformRelationCard';
import { OpenApiDefinitionWidget } from '../OpenApiDefinitionWidget';

const useStyles = makeStyles(
    (theme: Theme) => ({
        root: {
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'inherit',
            color: theme.palette.navigation.indicator
        },
        icon: {
            marginRight: theme.spacing(0.5),
            color: theme.palette.text.secondary,
            '& svg': {
                verticalAlign: 'middle',
            },
        },
        gridItemCard: {
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 10px)', // for pages without content header
            marginBottom: '10px',
        },
    }),
);

export const ApiPlatformDefinitionCard = () => {

    const { entity } = useEntity<ApiEntity>();  

    const classes = useStyles();

    const project = entity.metadata[ANNOTATION_API_PROJECT];
    const apiVersion = entity.metadata[ANNOTATION_API_VERSION]?.toString().toUpperCase();
    const groupId = `c4rth.${project}.apis`;
    const artifactId = `${entity.metadata[ANNOTATION_API_NAME]}-openapi`;
    const artifactUrl = `https://dev.azure.com/organization/${project}/_artifacts/feed/feedName/maven/${groupId}%2F${artifactId}/overview/${apiVersion}`
    const artifactText = `${groupId}:${artifactId}:${apiVersion}`;
    const mavenXml = `
<dependency>
    <groupId>${groupId}</groupId>
    <artifactId>${artifactId}</artifactId>
    <version>${apiVersion}</version>
    <type>yaml</type>
</dependency>
`;
    const cardClass = classes.gridItemCard;

    return (
        <TabbedLayout>
            <TabbedLayout.Route path="/" title="OpenApi">
                <OpenApiDefinitionWidget definition={entity.spec.definition.toString()} />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/raw" title="Raw">
                <PlainApiDefinitionWidget
                    definition={entity.spec.definition}
                    language={entity.spec.type}
                />
            </TabbedLayout.Route>
            {isApiDocsSpectralLinterAvailable(entity) ?
                <TabbedLayout.Route path="/linter" title="Linter">
                    <EntityApiDocsSpectralLinterCard />
                </TabbedLayout.Route>
                : null
            }
            <TabbedLayout.Route path="/services" title="Services">
                <Grid container spacing={3} alignItems="stretch">
                    <Grid item md={6}>
                        <ApiPlatformRelationCard dependency='provider' />
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <ApiPlatformRelationCard dependency='consumer' />
                    </Grid>
                </Grid>
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/info" title="Info">
                <InfoCard title='About' divider className={cardClass}>
                    <Box sx={{ mb: 4 }}>
                        <AboutField
                            label="API reference"
                            gridSizes={{ xs: 12 }} >
                            <EntityRefLink entityRef={entity!} />
                        </AboutField>
                    </Box>
                    <AboutContent entity={entity} />
                    <Box sx={{ mt: 5 }}>
                        <AboutField
                            label="Azure Artifact"
                            gridSizes={{ xs: 12 }} >
                            <Link to={artifactUrl} target="_blank" rel="noopener noreferrer" >
                                <Box component="span" className={classes.root}>
                                    <Box component="span" className={classes.icon}>
                                        <CloudCircleIcon fontSize="inherit" />
                                    </Box>
                                    {artifactText}
                                </Box>
                            </Link>
                        </AboutField>
                    </Box>
                    <Box sx={{ mt: 5 }}>
                        <AboutField
                            label="Get this package"
                            gridSizes={{ xs: 4 }}>
                            <CodeSnippet text={mavenXml} language="xmlDoc" showCopyCodeButton />
                        </AboutField>
                    </Box>
                </InfoCard>
            </TabbedLayout.Route>
        </TabbedLayout>
    );
}
