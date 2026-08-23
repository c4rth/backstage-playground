import { createBackend } from '@backstage/backend-defaults';
import { customPermissionPolicyModule } from './plugins/policy';
import { microsoftGraphTransformerModule } from './plugins/msgraph';

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-techdocs-backend'));
backend.add(import('@backstage/plugin-events-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-microsoft-provider'));
// See https://backstage.io/docs/auth/guest/provider
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);
backend.add(import('@backstage/plugin-catalog-backend-module-msgraph'));
backend.add(microsoftGraphTransformerModule);

backend.add(import('@backstage/plugin-catalog-backend-module-openapi'));

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(customPermissionPolicyModule);

// search plugin
backend.add(import('@backstage/plugin-search-backend'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));
backend.add(import('@internal/plugin-search-backend-module-api-platform'));
backend.add(import('@internal/plugin-search-backend-module-mca'));

// notifications plugin
// backend.add(import('@backstage/plugin-signals-backend'));
// backend.add(import('@backstage/plugin-notifications-backend'));

// Azure DevOps
backend.add(import('@backstage-community/plugin-azure-devops-backend'));
backend.add(
  import('@backstage-community/plugin-catalog-backend-module-azure-devops-annotator-processor'),
);

// Scaffolder Actions
backend.add(import('@backstage/plugin-scaffolder-backend-module-azure'));
backend.add(
  import('@backstage-community/plugin-scaffolder-backend-module-azure-devops'),
);
backend.add(import('@internal/plugin-scaffolder-extensions-backend'));

// Kubernetes
// backend.add(import('@backstage/plugin-kubernetes-backend'));

// SonarQube
backend.add(import('@backstage-community/plugin-sonarqube-backend'));

// DevTools
backend.add(import('@backstage/plugin-devtools-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-unprocessed'));

// Api Platform
backend.add(import('@internal/plugin-api-platform-backend'));

// Mca Components
backend.add(import('@internal/plugin-mca-backend'));

// MCP
backend.add(import('@backstage/plugin-mcp-actions-backend'));

// Analytics
backend.add(import('@internal/plugin-analytics-backend'));

// Start
backend.start();
