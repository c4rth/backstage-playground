import {
  createTranslationRef,
  TranslationFunction,
} from '@backstage/frontend-plugin-api';

export const mcaMetadata = {
  title: 'MCA',
  operationsTitle: 'MCA Operations',
  baseTypesTitle: 'MCA BaseTypes',
} as const;

export const mcaTranslationRef = createTranslationRef({
  id: 'plugin.mca',
  messages: {
    componentExplorer: {
      title: 'MCA Components',
      description:
        'Explore all MCA components (operations and elements) registered in Backstage. This screen provides a searchable and filterable table of components, allowing you to quickly find, review, and navigate to detailed information about each operation or element in your platform.',
      purpose:
        "The MCA Components Explorer helps you maintain visibility and control over your organization's MCA operations and elements, making it easy to discover, document, and govern your technical building blocks.",
      type: 'Type',
      operations: 'Operations',
      elements: 'Elements',
      allComponents: 'All components',
      visibility:
        'Only MCA components promoted to PRD or those where P is ≥ to the current PRD P value are visible.',
      lastUpdated: 'Last updated: {{date}}',
      unknownDate: 'Unknown',
    },
    baseTypeExplorer: {
      title: 'MCA BaseTypes',
      description:
        'Explore all MCA base type definitions registered in Backstage. This screen provides a searchable and filterable table of base types, including their names and associated packages. Use this view to quickly find, review, and navigate to detailed information about each base type in your platform.',
      purpose:
        "The MCA BaseType Explorer helps you maintain visibility and control over your organization's base types, making it easy to discover, document, and govern your technical building blocks.",
    },
    baseTypeTable: {
      name: 'Name',
      package: 'Package',
      title: 'BaseTypes ({{total}})',
      filterPlaceholder: 'Filter...',
      filterLabel: 'Filter',
      empty: 'No data available',
      error: 'Failed to call MCA API',
    },
    componentTable: {
      name: 'Name',
      baseline: 'Baseline',
      package: 'Package',
      system: 'System',
      operations: 'Operations',
      elements: 'Elements',
      allComponents: 'All components',
      unknownType: 'Unknown type',
      title: '{{type}} ({{total}})',
      filterPlaceholder: 'Filter...',
      filterLabel: 'Filter',
      empty: 'No data available',
    },
    baseTypeDefinition: {
      title: 'MCA BaseType - {{name}}',
      breadcrumb: 'MCA BaseTypes',
      frameTitle: 'BaseType :{{url}}',
      notFound: 'MCA basetype {{name}} not found',
      missingBackend:
        'Backend URL not configured. Please check backend.baseUrl in app-config.yaml',
    },
    componentDefinition: {
      title: 'MCA Component - {{name}}',
      breadcrumb: 'MCA Components',
      version: 'Version',
      productionVersion: '{{version}} (PRD)',
      notFound: 'MCA component {{name}} not found',
      unknownType: 'Unknown MCA component type: {{component}}',
      tabs: {
        overview: 'Overview',
        inputFields: 'Input Fields',
        outputFields: 'Output Fields',
        fields: 'Fields',
        methods: 'Methods',
        raw: 'Raw',
      },
    },
    elementDefinition: {
      invalid: 'Invalid element definition: required node not found',
    },
    operationDefinition: {
      missingAnalysis:
        'Invalid operation definition: operation analysis not found',
      missingNode: 'Invalid operation definition: required node not found',
      unknownType: 'Unknown operation type: {{type}}',
    },
    elementAbout: {
      title: 'About',
      package: 'Package',
      extends: 'Extends',
      description: 'Description',
    },
    operationAbout: {
      title: 'About',
      package: 'Package',
      extends: 'Extends',
      version: 'Operation Version',
      type: 'Operation Type',
      flowController: 'Flow Controller',
      bs: 'BS',
      bFunction: 'B-Function',
      fic: 'FIC',
      tic: 'TIC',
      cic: 'CIC',
      caching: 'Caching',
      cacheEnabled: 'TRUE',
      cacheDisabled: 'FALSE',
      description: 'Description',
      originalUrl: 'original: {{url}}',
    },
    fields: {
      name: 'Name',
      class: 'Class',
      description: 'Description',
      mandatory: 'Mandatory field',
      clientElement: '{{client}} of {{element}}',
      elementTitle: 'Fields',
      inputTitle: 'Input Fields',
      outputTitle: 'Output Fields',
      title: '{{title}} ({{total}})',
      filterPlaceholder: 'Filter...',
      filterLabel: 'Filter',
      emptyElement: 'No fields found for this element.',
      emptyInput: 'No fields found for this input.',
      emptyOutput: 'No fields found for this output.',
    },
    methods: {
      name: 'Method Name',
      title: 'Implemented Methods ({{total}})',
      filterPlaceholder: 'Filter...',
      filterLabel: 'Filter',
      emptyElement: 'No implemented methods found for this element.',
      emptyOperation: 'No implemented methods found for this operation.',
    },
    searchResult: {
      kind: 'Kind: {{kind}}',
      applicationCode: 'Application Code: {{code}}',
      productionVersion: 'PRD: {{version}}',
      otherVersions: 'Other versions: {{versions}}',
    },
    snippet: {
      copied: 'Copied to clipboard!',
      copy: 'Copy XML to clipboard',
      download: 'Download XML',
    },
    definition: {
      invalidXml: 'Invalid XML: {{message}} (line {{line}})',
    },
  },
});

export type McaTranslator = TranslationFunction<typeof mcaTranslationRef.T>;
