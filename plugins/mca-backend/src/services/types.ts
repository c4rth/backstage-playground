import {
  McaBaseType,
  McaBaseTypeListFields,
  McaBaseTypeListResult,
  McaComponent,
  McaComponentListFields,
  McaComponentListResult,
  McaComponentType,
  McaVersions,
} from '@internal/plugin-mca-common';
import type { SortDirection } from '@internal/plugin-mca-common';

export type McaComponentOrderByOptions = {
  field: McaComponentListFields;
  direction: SortDirection;
};

export type McaComponentListRequest = {
  offset?: number;
  limit?: number;
  orderBy?: McaComponentOrderByOptions;
  search?: string;
  type: McaComponentType;
};

export type McaBaseTypeListRequest = {
  offset?: number;
  limit?: number;
  orderBy?: McaBaseTypeOrderByOptions;
  search?: string;
};

export type McaBaseTypeOrderByOptions = {
  field: McaBaseTypeListFields;
  direction: SortDirection;
};

export type McaJavadocAsset = {
  content: Buffer;
  contentType?: string;
};

export interface McaService {
  getMcaComponentsCount(request: { type: McaComponentType }): Promise<number>;

  listMcaComponents(
    request: McaComponentListRequest,
  ): Promise<McaComponentListResult>;

  getMcaComponent(request: {
    component: string;
  }): Promise<McaComponent | undefined>;

  getMcaVersions(): Promise<McaVersions>;

  listMcaBaseTypes(
    request: McaBaseTypeListRequest,
  ): Promise<McaBaseTypeListResult>;

  getMcaBaseTypesCount(): Promise<number>;

  getMcaBaseType(request: {
    baseType: string;
  }): Promise<McaBaseType | undefined>;

  getMcaBaseTypeJavadoc(request: {
    baseType: string;
    packageName: string;
  }): Promise<string>;

  getMcaBaseTypeJavadocAsset(request: {
    path: string;
  }): Promise<McaJavadocAsset>;

  getLastModifiedDate(): Promise<Date | undefined>;
}
