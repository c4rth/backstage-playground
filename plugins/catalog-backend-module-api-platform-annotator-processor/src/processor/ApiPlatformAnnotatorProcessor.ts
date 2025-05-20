import { LoggerService } from '@backstage/backend-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { CatalogProcessor } from '@backstage/plugin-catalog-node';

/** @public */
export class ApiPlatformAnnotatorProcessor implements CatalogProcessor {
    
  private logger: LoggerService;

    constructor(logger: LoggerService) {
        this.logger = logger;
    }

    getProcessorName(): string {
        return 'ApiPlatformAnnotatorProcessor';
    }

    static fromConfig(logger: LoggerService): ApiPlatformAnnotatorProcessor {
        return new ApiPlatformAnnotatorProcessor(logger);
    }

    async preProcessEntity(
        entity: Entity,
    ): Promise<Entity> {

        if (entity.kind.toLocaleLowerCase() === 'api') {
            if (entity.spec?.type === 'openapi') {
                const system = entity.metadata['api-project'];
                if (!entity.spec?.system && system) {
                    this.logger.debug(`Adding spec.system ${system} to entity ${entity.metadata.name}`);
                    entity.spec.system = system;
                }
            }
        }
        return entity;
    }
}