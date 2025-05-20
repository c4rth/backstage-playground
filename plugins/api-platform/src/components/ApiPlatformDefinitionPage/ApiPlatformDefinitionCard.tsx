import {
    CodeSnippet,
    InfoCard,
    TabbedLayout,
} from '@backstage/core-components';
import { ApiEntity } from "@backstage/catalog-model"
import { PlainApiDefinitionWidget } from '@backstage/plugin-api-docs';
import { Box, Grid, makeStyles, Theme } from '@material-ui/core';
import { EntityRefLink, useEntity } from '@backstage/plugin-catalog-react';
import { AboutContent, AboutField } from '@backstage/plugin-catalog';
import { Link } from 'react-router-dom';
import CloudCircleIcon from '@material-ui/icons/CloudCircle';
import { ANNOTATION_API_NAME, ANNOTATION_API_PROJECT, ANNOTATION_API_VERSION } from '@internal/plugin-api-platform-common';
import { OpenApiDefinitionWidget } from '@internal/plugin-api-swagger-docs';
// Spectral 
import { EntityApiDocsSpectralLinterCard, isApiDocsSpectralLinterAvailable } from '@internal/plugin-api-docs-spectral-linter';
import { ApiPlatformRelationCard } from './ApiPlatformRelationCard';
import LanguageIcon from '@material-ui/icons/Language';
import { useMemo } from 'react';

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
    const apiVersion = useMemo(() => entity.metadata[ANNOTATION_API_VERSION]?.toString().toUpperCase(), [entity]);
    const groupId = useMemo(() => `c4rth.${project}.apis`, [project]);
    const artifactId = useMemo(() => `${entity.metadata[ANNOTATION_API_NAME]}-openapi`, [entity]);
    const artifactUrl = useMemo(() => `https://dev.azure.com/organization/${project}/_artifacts/feed/feedName/maven/${groupId}%2F${artifactId}/overview/${apiVersion}`, [project, groupId, artifactId, apiVersion]);
    const artifactText = useMemo(() => `${groupId}:${artifactId}:${apiVersion}`, [groupId, artifactId, apiVersion]);
    const mavenXml = useMemo(() => `\n<dependency>\n    <groupId>${groupId}</groupId>\n    <artifactId>${artifactId}</artifactId>\n    <version>${apiVersion}</version>\n    <type>yaml</type>\n</dependency>\n`, [groupId, artifactId, apiVersion]);
    const href = useMemo(() => `https://api-platform.example.com/api-resolved/${project}/${entity.metadata[ANNOTATION_API_NAME]}/${entity.metadata[ANNOTATION_API_VERSION]}`, [project, entity]);
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
            {isApiDocsSpectralLinterAvailable(entity) && (
                <TabbedLayout.Route path="/linter" title="Linter">
                    <EntityApiDocsSpectralLinterCard />
                </TabbedLayout.Route>
            )}
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
                            label="Maven Snippet"
                            gridSizes={{ xs: 4 }}>
                            <CodeSnippet text={mavenXml} language="xmlDoc" showCopyCodeButton />
                        </AboutField>
                    </Box>
                    <Box sx={{ mt: 5 }}>
                        <AboutField
                            label="API Platform URL"
                            gridSizes={{ xs: 12 }}>
                            <Box component="span" className={classes.root}>
                                <Box component="span" className={classes.icon}>
                                    <LanguageIcon fontSize="inherit" />
                                </Box>
                                <Link to={href} target="_blank" rel="noopener noreferrer" >
                                    {href}
                                </Link>
                            </Box>
                        </AboutField>
                    </Box>
                </InfoCard>
            </TabbedLayout.Route>
        </TabbedLayout>
    );
}
