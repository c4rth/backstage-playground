
import {
    createFrontendPlugin,
    SubPageBlueprint,
} from '@backstage/frontend-plugin-api';
import { ExternalDependenciesContent } from '@backstage/plugin-devtools';
import { AnalyticsContent } from '@internal/plugin-analytics';
import { CatalogAdminPage } from '@internal/plugin-catalog-admin';
import { EntityValidationContent } from '@backstage-community/plugin-entity-validation';
import { Box } from '@backstage/ui';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { devToolsAdministerPermission } from '@backstage/plugin-devtools-common';

export const externalDependenciesDevToolsContent = SubPageBlueprint.make(
    {
        name: 'external-dependencies',
        attachTo: { id: 'page:devtools', input: 'pages' },
        params: {
            path: 'external-dependencies',
            title: 'External Dependencies',
            loader: async () => {
                return (
                    <RequirePermission permission={devToolsAdministerPermission}>
                        <Box m="4">
                            <ExternalDependenciesContent />
                        </Box>
                    </RequirePermission>
                );
            },
        },
    },
);

export const analyticsDevToolsContent = SubPageBlueprint.make(
    {
        name: 'analytics',
        attachTo: { id: 'page:devtools', input: 'pages' },
        params: {
            path: 'analytics',
            title: 'Analytics',
            loader: async () => {
                return (
                    <RequirePermission permission={devToolsAdministerPermission}>
                        <AnalyticsContent />
                    </RequirePermission>
                );
            },
        },
    },
);


export const catalogAdminDevToolsContent = SubPageBlueprint.make(
    {
        name: 'catalog-admin',
        attachTo: { id: 'page:devtools', input: 'pages' },
        params: {
            path: 'catalog-admin',
            title: 'Catalog Admin',
            loader: async () => {
                return (
                    <RequirePermission permission={devToolsAdministerPermission}>
                        <CatalogAdminPage />
                    </RequirePermission>
                );
            },
        },
    },
);

export const entityValidationDevToolsContent = SubPageBlueprint.make(
    {
        name: 'entity-validation',
        attachTo: { id: 'page:devtools', input: 'pages' },
        params: {
            path: 'entity-validation',
            title: 'Entity Validation',
            loader: async () => {
                return (
                    <RequirePermission permission={devToolsAdministerPermission}>
                        <Box m="10">
                            <EntityValidationContent />
                        </Box>
                    </RequirePermission>
                );
            },
        },
    },
);

export const devToolsExtensionPlugin = createFrontendPlugin({
    pluginId: 'devtools-extensions',
    extensions: [
        externalDependenciesDevToolsContent,
        analyticsDevToolsContent,
        catalogAdminDevToolsContent,
        entityValidationDevToolsContent,
    ],
});