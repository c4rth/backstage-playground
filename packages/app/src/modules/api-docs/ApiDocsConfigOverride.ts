import { ApiBlueprint } from '@backstage/frontend-plugin-api';
import {
  apiDocsConfigRef,
  defaultDefinitionWidgets,
} from '@backstage/plugin-api-docs';
import { ApiEntity } from '@backstage/catalog-model';

export const ApiDocsConfigOverride = ApiBlueprint.make({
  name: 'config',
  params: defineParams =>
    defineParams({
      api: apiDocsConfigRef,
      deps: {},
      factory: () => {
        const definitionWidgets = defaultDefinitionWidgets();
        return {
          getApiDefinitionWidget: (apiEntity: ApiEntity) => {
            return definitionWidgets.find(
              (d: { type: string }) => d.type === apiEntity.spec.type,
            );
          },
        };
      },
    }),
});
