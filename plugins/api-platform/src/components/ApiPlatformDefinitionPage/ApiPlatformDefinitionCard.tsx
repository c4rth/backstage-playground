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
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { memo, useMemo } from 'react';

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

const IconWithText = memo<{ icon: React.ReactNode; child: React.ReactNode; classes: any }>(
    ({ icon, child, classes }) => (
        <Box component="span" className={classes.root}>
            <Box component="span" className={classes.icon}>
                {icon}
            </Box>
            {child}
        </Box>
    )
);

export const ApiPlatformDefinitionCard = () => {
    const { entity } = useEntity<ApiEntity>();
    const classes = useStyles();
    const configApi = useApi(configApiRef);

    const config = useMemo(() => ({
        organization: configApi.getString('apiPlatform.organization'),
        feedName: configApi.getString('apiPlatform.feedName'),
        apiPlatformDns: configApi.getString('apiPlatform.dns'),
        groupPrefix: configApi.getString('apiPlatform.groupPrefix'),
    }), [configApi]);

    const apiData = useMemo(() => {
        const project = entity.metadata[ANNOTATION_API_PROJECT];
        const apiName = entity.metadata[ANNOTATION_API_NAME];
        const apiVersion = entity.metadata[ANNOTATION_API_VERSION]?.toString().toUpperCase();
        const groupId = `${config.groupPrefix}.${project}.apis`;
        const artifactId = `${apiName}-openapi`;

        return {
            project,
            apiName,
            apiVersion,
            groupId,
            artifactId,
            artifactUrl: `https://dev.azure.com/${config.organization}/${project}/_artifacts/feed/${config.feedName}/maven/${groupId}%2F${artifactId}/overview/${apiVersion}`,
            artifactText: `${groupId}:${artifactId}:${apiVersion}`,
            platformUrl: `https://${config.apiPlatformDns}/api-resolved/${project}/${apiName}/${entity.metadata[ANNOTATION_API_VERSION]}`,
        };
    }, [entity.metadata, config]);

    const mavenXml = useMemo(() => `
<dependency>
    <groupId>${apiData.groupId}</groupId>
    <artifactId>${apiData.artifactId}</artifactId>
    <version>${apiData.apiVersion}</version>
    <type>yaml</type>
</dependency>
`, [apiData.groupId, apiData.artifactId, apiData.apiVersion]);

    const apiSpec = useMemo(() => ({
        definition: entity.spec.definition.toString(),
        language: entity.spec.type,
    }), [entity.spec.definition, entity.spec.type]);

    const isLinterAvailable = useMemo(() =>
        isApiDocsSpectralLinterAvailable(entity),
        [entity]
    );

    return (
        <TabbedLayout>
            <TabbedLayout.Route path="/" title="OpenApi">
                <OpenApiDefinitionWidget definition={apiSpec.definition} />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/raw" title="Raw">
                <PlainApiDefinitionWidget
                    definition={apiSpec.definition}
                    language={apiSpec.language}
                />
            </TabbedLayout.Route>
            {isLinterAvailable && (
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
                <InfoCard title='About' divider className={classes.gridItemCard}>
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
                            <Link to={apiData.artifactUrl} target="_blank" rel="noopener noreferrer">
                                <IconWithText
                                    icon={<CloudCircleIcon fontSize="inherit" />}
                                    child={<>{apiData.artifactText}</>}
                                    classes={classes}
                                />
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
                        <AboutField label="API Platform URL" gridSizes={{ xs: 12 }}>
                            <IconWithText
                                icon={<LanguageIcon fontSize="inherit" />}
                                child={
                                    <Link to={apiData.platformUrl} target="_blank" rel="noopener noreferrer">
                                        {apiData.platformUrl}
                                    </Link>
                                }
                                classes={classes}
                            />
                        </AboutField>
                    </Box>
                </InfoCard>
            </TabbedLayout.Route>
        </TabbedLayout>
    );
}
