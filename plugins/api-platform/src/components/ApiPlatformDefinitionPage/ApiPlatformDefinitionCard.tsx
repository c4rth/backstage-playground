import {
    CardTab,
    CodeSnippet,
    TabbedCard,
} from '@backstage/core-components';
import { ApiEntity } from "@backstage/catalog-model"
import React from 'react';
import { OpenApiDefinitionWidget, PlainApiDefinitionWidget } from '@backstage/plugin-api-docs';
import { Box, makeStyles, Theme } from '@material-ui/core';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { AboutContent, AboutField } from '@backstage/plugin-catalog';
import { Link } from 'react-router-dom';
import CloudCircleIcon from '@material-ui/icons/CloudCircle';
import { API_PLATFORM_API_NAME_ANNOTATION, API_PLATFORM_API_PROJECT_ANNOTATION, API_PLATFORM_API_VERSION_ANNOTATION } from '@internal/plugin-api-platform-common';
// Spectral 
import { EntityApiDocsSpectralLinterCard } from '../EntityApiDocsSpectralLinterContent';
import { isApiDocsSpectralLinterAvailable } from '../../lib/helper';

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
    }),
    { name: 'CatalogReactEntityDisplayName' },
);

export const ApiPlatformDefinitionCard = (props: { apiEntity: ApiEntity }) => {

    const { apiEntity } = props;

    const classes = useStyles();

    const project = apiEntity.metadata[API_PLATFORM_API_PROJECT_ANNOTATION];
    const apiVersion = apiEntity.metadata[API_PLATFORM_API_VERSION_ANNOTATION]?.toString().toUpperCase();
    const groupId = `c4rth.${project}.apis`;
    const artifactId = `${apiEntity.metadata[API_PLATFORM_API_NAME_ANNOTATION]}-openapi`;
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

    return (
        <TabbedCard title="" >
            <CardTab label='OpenApi' key="widget">
                <OpenApiDefinitionWidget definition={apiEntity.spec.definition.toString()} />
            </CardTab>
            <CardTab label="Raw" key="raw">
                <PlainApiDefinitionWidget
                    definition={apiEntity.spec.definition}
                    language={apiEntity.spec.type}
                />
            </CardTab>
            {isApiDocsSpectralLinterAvailable(apiEntity) ?
                <CardTab label="Linter" key="linter">
                    <EntityApiDocsSpectralLinterCard entity={apiEntity} />
                </CardTab>
                : <div />
            }
            <CardTab label="Info" key="info" className="m-3">
                <Box sx={{ mb: 4 }}>
                    <AboutField
                        label="API reference"
                        gridSizes={{ xs: 12 }}
                    >
                        <EntityRefLink entityRef={apiEntity!} />
                    </AboutField>
                </Box>
                <AboutContent entity={apiEntity} />
                <Box sx={{ mt: 5 }}>
                    <AboutField
                        label="Azure Artifact"
                        gridSizes={{ xs: 12 }}
                    >
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
                        gridSizes={{ xs: 4 }}
                    >
                        <CodeSnippet text={mavenXml} language="xmlDoc" showCopyCodeButton />
                    </AboutField>
                </Box>
            </CardTab>
        </TabbedCard >
    );
}