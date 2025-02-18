import { createBackend } from '@backstage/backend-defaults';
import { myGroupTransformer, myOrganizationTransformer, myUserTransformer } from './plugins/msgraph';
import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { MyPermissionPolicy } from './plugins/policy';
import { microsoftGraphOrgEntityProviderTransformExtensionPoint } from '@backstage/plugin-catalog-backend-module-msgraph';
import { catalogCollatorExtensionPoint } from '@backstage/plugin-search-backend-module-catalog';
import { apiPlatformCatalogCollatorEntityTransformer } from '@internal/plugin-api-platform-backend';
// TechDocs
// import {
//  DocsBuildStrategy,
//  techdocsBuildsExtensionPoint,
// techdocsGeneratorExtensionPoint,
// techdocsPreparerExtensionPoint,
// TechdocsGenerator,
// } from '@backstage/plugin-techdocs-node';


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
backend.add(import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'));
backend.add(import('@backstage/plugin-catalog-backend-module-msgraph'));
backend.add(createBackendModule({
  pluginId: 'catalog',
  moduleId: 'microsoft-graph-extensions',
  register(env) {
    env.registerInit({
      deps: {
        microsoftGraphTransformers: microsoftGraphOrgEntityProviderTransformExtensionPoint,
      },
      async init({ microsoftGraphTransformers }) {
        microsoftGraphTransformers.setUserTransformer(myUserTransformer);
        microsoftGraphTransformers.setGroupTransformer(myGroupTransformer);
        microsoftGraphTransformers.setOrganizationTransformer(myOrganizationTransformer);
      }
    });
  },
}));
backend.add(import('@backstage/plugin-catalog-backend-module-openapi'));

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
// backend.add(import('@backstage/plugin-permission-backend-module-allow-all-policy'));

backend.add(createBackendModule({
  pluginId: 'permission',
  moduleId: 'my-policy',
  register(reg) {
    reg.registerInit({
      deps: {
        policy: policyExtensionPoint,
        logger: coreServices.logger
      },
      async init({ policy, logger }) {
        policy.setPolicy(new MyPermissionPolicy(logger));
      },
    });
  },
}));

// search plugin
backend.add(import('@backstage/plugin-search-backend'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(createBackendModule({
  pluginId: 'search',
  moduleId: 'api-platform-catalog-collator-extension',
  register(env) {
    env.registerInit({
      deps: {
        entityTransformer: catalogCollatorExtensionPoint,
      },
      async init({ entityTransformer }) {
        entityTransformer.setEntityTransformer(apiPlatformCatalogCollatorEntityTransformer);
      }
    });
  },
}));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// notifications plugin
backend.add(import('@backstage/plugin-signals-backend'));
backend.add(import('@backstage/plugin-notifications-backend'));

// Azure DevOps
backend.add(import('@backstage-community/plugin-azure-devops-backend'));
backend.add(import('@backstage-community/plugin-catalog-backend-module-azure-devops-annotator-processor'));

// Actions
backend.add(import('@parfuemerie-douglas/scaffolder-backend-module-azure-repositories'))
backend.add(import('@backstage-community/plugin-scaffolder-backend-module-azure-devops'));

// Kubernetes
backend.add(import('@backstage/plugin-kubernetes-backend'));

// SonarQube
backend.add(import('@backstage-community/plugin-sonarqube-backend'));

// Api Platform
backend.add(import('@internal/plugin-api-platform-backend'));
backend.start();
