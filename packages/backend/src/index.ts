import { createBackend } from '@backstage/backend-defaults';
import { myGroupTransformer, myOrganizationTransformer, myUserTransformer } from './plugins/msgraph';
import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import { microsoftGraphOrgEntityProviderTransformExtensionPoint } from '@backstage/plugin-catalog-backend-module-msgraph/alpha';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { MyPermissionPolicy } from './plugins/policy';
import { catalogCollatorExtensionPoint } from '@backstage/plugin-search-backend-module-catalog/alpha';
import { myCatalogCollatorEntityTransformer } from './plugins/collator';
// TechDocs
//import {
//  DocsBuildStrategy,
//  techdocsBuildsExtensionPoint,
//techdocsGeneratorExtensionPoint,
//techdocsPreparerExtensionPoint,
//TechdocsGenerator,
//} from '@backstage/plugin-techdocs-node';


const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-proxy-backend/alpha'));
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
backend.add(import('@backstage/plugin-techdocs-backend/alpha'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://backstage.io/docs/auth/guest/provider
backend.add(import('@backstage/plugin-auth-backend-module-microsoft-provider'));

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'));
backend.add(import('@backstage/plugin-catalog-backend-module-msgraph/alpha'));
backend.add(createBackendModule({
  pluginId: 'catalog',
  moduleId: 'microsoft-graph-extensions',
  register(env) {
    env.registerInit({
      deps: {
        microsoftGraphTransformers: microsoftGraphOrgEntityProviderTransformExtensionPoint,
        logger: coreServices.logger
      },
      async init({ microsoftGraphTransformers, logger }) {
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
backend.add(import('@backstage/plugin-permission-backend/alpha'));
//backend.add(import('@backstage/plugin-permission-backend-module-allow-all-policy'));
//backend.add(import('@janus-idp/backstage-plugin-rbac-backend'));

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
backend.add(import('@backstage/plugin-search-backend/alpha'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg/alpha'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog/alpha'));
backend.add(createBackendModule({
  pluginId: 'search',
  moduleId: 'catalog-collator-extension',
  register(env) {
    env.registerInit({
      deps: {
        entityTransformer: catalogCollatorExtensionPoint,
      },
      async init({ entityTransformer }) {
        entityTransformer.setEntityTransformer(myCatalogCollatorEntityTransformer);
      }
    });
  },
}));

backend.add(import('@backstage/plugin-search-backend-module-techdocs/alpha'));

// kubernetes
backend.add(import('@backstage/plugin-kubernetes-backend/alpha'));

// notifications plugin
backend.add(import('@backstage/plugin-signals-backend'));
backend.add(import('@backstage/plugin-notifications-backend'));

// Q&A
backend.add(import('@drodil/backstage-plugin-qeta-backend'));
backend.add(import('@drodil/backstage-plugin-search-backend-module-qeta'));

// Azure DevOps
backend.add(import('@backstage-community/plugin-catalog-backend-module-azure-devops-annotator-processor'));

// Actions
backend.add(import('@internal/scaffolder-backend-module-azure-repositories'));

backend.start();
