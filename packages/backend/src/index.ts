import { createBackend } from '@backstage/backend-defaults';
import { myGroupTransformer, myOrganizationTransformer, myUserTransformer } from './plugins/msgraph';
import { createBackendModule } from '@backstage/backend-plugin-api';
import { microsoftGraphOrgEntityProviderTransformExtensionPoint } from '@backstage/plugin-catalog-backend-module-msgraph/alpha';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { MyPermissionPolicy } from './plugins/policy';
// Azure DevOps
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { coreServices } from '@backstage/backend-plugin-api';
import { AzureDevOpsAnnotatorProcessor } from '@backstage-community/plugin-azure-devops-backend';

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend/alpha'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://github.com/backstage/backstage/blob/master/docs/auth/guest/provider.md
backend.add(import('@backstage/plugin-auth-backend-module-microsoft-provider'));


// permission plugin
backend.add(import('@backstage/plugin-permission-backend/alpha'));
//backend.add(import('@backstage/plugin-permission-backend-module-allow-all-policy'));
//backend.add(import('@janus-idp/backstage-plugin-rbac-backend'));

backend.add(createBackendModule({
    pluginId: 'permission',
    moduleId: 'my-policy',
    register(reg) {
      reg.registerInit({
        deps: { policy: policyExtensionPoint },
        async init({ policy }) {
          policy.setPolicy(new MyPermissionPolicy());
        },
      });
    },
  }));


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

//
backend.add(import('@backstage/plugin-proxy-backend/alpha'));
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
backend.add(import('@backstage/plugin-techdocs-backend/alpha'));

// search plugin
backend.add(import('@backstage/plugin-search-backend/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-catalog/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs/alpha'));

// notifications plugin
backend.add(import('@backstage/plugin-signals-backend'));
backend.add(import('@backstage/plugin-notifications-backend'));

// Q&A
backend.add(import('@drodil/backstage-plugin-qeta-backend'));
backend.add(import('@drodil/backstage-plugin-search-backend-module-qeta'));

// Azure DevOps
const catalogModuleCustomExtensions = createBackendModule({
  pluginId: 'catalog', // name of the plugin that the module is targeting
  moduleId: 'custom-extensions',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ catalog, config }) {
        catalog.addProcessor(AzureDevOpsAnnotatorProcessor.fromConfig(config));
      },
    });
  },
});
backend.add(import('@backstage-community/plugin-azure-devops-backend'));
backend.add(catalogModuleCustomExtensions());

backend.start();
