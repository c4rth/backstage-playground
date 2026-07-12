import {
    convertLegacyPlugin,
    convertLegacyPageExtension,
} from '@backstage/core-compat-api';
import { shortcutsPlugin, Shortcuts } from '@backstage-community/plugin-shortcuts';

export const shortcutsNfsPlugin = convertLegacyPlugin(shortcutsPlugin, {
    extensions: [convertLegacyPageExtension(Shortcuts)],
});

