import {
    convertLegacyPlugin,
    convertLegacyPageExtension,
} from '@backstage/core-compat-api';
import {
    azdoPlugin,
    AzureDevOpsPipelinePage,
    AzureDevOpsGitTagsPage,
    AzureReadmeCard,
} from '@internal/plugin-azure-devops';
import { analyticsPlugin, AnalyticsContent } from '@internal/plugin-analytics';
import { shortcutsPlugin, Shortcuts } from '@backstage-community/plugin-shortcuts';

export const azdoNfsPlugin = convertLegacyPlugin(azdoPlugin, {
    extensions: [
        convertLegacyPageExtension(AzureDevOpsPipelinePage),
        convertLegacyPageExtension(AzureDevOpsGitTagsPage),
        convertLegacyPageExtension(AzureReadmeCard),
    ],
});

export const analyticsNfsPlugin = convertLegacyPlugin(analyticsPlugin, {
    extensions: [convertLegacyPageExtension(AnalyticsContent)],
});

export const shortcutsNfsPlugin = convertLegacyPlugin(shortcutsPlugin, {
    extensions: [convertLegacyPageExtension(Shortcuts)],
});

