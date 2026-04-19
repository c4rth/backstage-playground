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

export type McaComponentOrderByOptions = {
  field: McaComponentListFields;
  direction: 'asc' | 'desc';
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
  direction: 'asc' | 'desc';
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
}
