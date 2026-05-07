import {
  McaBaseType,
  McaBaseTypeListResult,
  McaComponent,
  McaComponentListResult,
  McaComponentType,
  McaVersions,
} from '@internal/plugin-mca-common';
import {
  McaBaseTypeOrderByOptions,
  McaComponentOrderByOptions,
} from '../services/types';

export interface McaComponentStore {
  getMcaComponent(component: string): Promise<McaComponent | undefined>;
  getMcaComponents(
    limit: number,
    offset: number,
    type: McaComponentType,
    orderBy?: McaComponentOrderByOptions,
    search?: string,
  ): Promise<McaComponentListResult>;
  getMcaComponentsCount(type: McaComponentType): Promise<number>;
  getMcaVersions(): Promise<McaVersions | undefined>;
  getMcaBaseTypes(
    limit: number,
    offset: number,
    orderBy?: McaBaseTypeOrderByOptions,
    search?: string,
  ): Promise<McaBaseTypeListResult>;
  getMcaBaseTypesCount(): Promise<number>;
  getMcaBaseType(baseTypeName: string): Promise<McaBaseType | undefined>;

  addOrUpdateMcaVersions(mcaVersions: McaVersions): Promise<void>;
  addOrUpdateMcaComponent(mcaComponent: McaComponent): Promise<void>;
  addOrUpdateBaseType(baseType: McaBaseType): Promise<void>;

  setLastModifiedDate(date: Date): Promise<void>;
  getLastModifiedDate(): Promise<Date | undefined>;
}
