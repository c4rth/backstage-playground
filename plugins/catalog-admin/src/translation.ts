import {
  createTranslationRef,
  TranslationFunction,
} from '@backstage/frontend-plugin-api';

export const catalogAdminTranslationRef = createTranslationRef({
  id: 'plugin.catalog-admin',
  messages: {
    page: {
      tabs: {
        catalog: 'Catalog',
        import: 'Import',
        validation: 'Entity Validation',
      },
      filters: {
        system: 'System',
        kind: 'Kind',
        api: 'API',
        library: 'Library',
        service: 'Service',
        techdocs: 'TechDocs',
        template: 'Template',
      },
      selectSystem:
        'Please select a system to view the entities associated with it.',
      loadSystemsError: 'Failed to load systems: {{error}}',
    },
    table: {
      columns: {
        name: 'Name',
        version: 'Version',
        entity: 'Entity',
        location: 'Location',
      },
      titles: {
        api: 'Apis of {{system}}',
        library: 'Librarys of {{system}}',
        service: 'Services of {{system}}',
        techdocs: 'Techdocss of {{system}}',
        template: 'Templates of {{system}}',
      },
      unsupportedKind: 'Unsupported kind: {{kind}}',
      empty: 'No data available',
      refresh: {
        button: 'Refresh ({{selection}})',
        all: 'all',
        title: 'Confirm Refresh',
        confirmAll: 'Are you sure you want to refresh all items?',
        confirmItems: 'Are you sure you want to refresh {{total}} items?',
        cancel: 'Cancel',
        action: 'Refresh',
        success: 'Successfully refreshed entity: {{entity}}',
        error: 'Failed to refresh entity: {{entity}} - {{error}}',
      },
      delete: {
        button: 'Delete ({{selection}})',
        all: 'all',
        title: 'Confirm Deletion',
        confirmAll: 'Are you sure you want to delete all items?',
        confirmItems: 'Are you sure you want to delete {{total}} items?',
        cancel: 'Cancel',
        action: 'Delete',
        success: 'Successfully deleted entity: {{entity}}',
        error: 'Failed to delete entity: {{entity}} - {{error}}',
      },
    },
  },
});

export type CatalogAdminTranslator = TranslationFunction<
  typeof catalogAdminTranslationRef.T
>;
