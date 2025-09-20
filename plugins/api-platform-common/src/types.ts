import { Entity } from "@backstage/catalog-model";

// API 

export type ApiVersionDefinition = {
  entityRef: string;
  version: string;
  project: string;
};

export type ApiRelationServiceDefinition = {
  entityRef: string;
  version: string;
  lifecycle: string;
};

export type ApiRelationDefinition = {
  apiVersion: string;
  services: ApiRelationServiceDefinition[];
};

export type ApiDefinitionsListFields =
  | 'name'
  | 'description'
  | 'system';

export const APIDEFINITIONS_FIELDS = [
  'name',
  'description',
  'system'] as const;

export type ApiDefinitionListResult = {
  items: Entity[];
  offset: number;
  limit: number;
  totalCount: number;
};

export type ApiDefinitionsOptions = {
  field: ApiDefinitionsListFields;
  direction: 'asc' | 'desc';
};

export type ApiDefinitionsListRequest = {
  offset?: number,
  limit?: number,
  orderBy?: ApiDefinitionsOptions,
  search?: string,
  ownership: OwnershipType;
  userEntityRef?: string | undefined;
};

// Services

export type ServiceEnvironmentDefinition = {
  imageVersion: string;
  entityRef: string;
  platform: string;
};

export type ServiceVersionDefinition = {
  version: string;
  environments: {
    tst?: ServiceEnvironmentDefinition;
    gtu?: ServiceEnvironmentDefinition;
    uat?: ServiceEnvironmentDefinition;
    ptp?: ServiceEnvironmentDefinition;
    prd?: ServiceEnvironmentDefinition;
  };
};

export type ServiceDefinition = {
  name: string;
  serviceName: string;
  owner: string;
  system: string
  versions: ServiceVersionDefinition[];
};

export type ServiceDefinitionListResult = {
  items: ServiceDefinition[];
  offset: number;
  limit: number;
  totalCount: number;
};

export type ServiceApisDefinition = {
  consumedApis?: string[];
  providedApis?: string[];
};

export type ServiceInformation = {
  applicationCode: string;
  serviceName: string;
  serviceVersion: string;
  imageVersion: string;
  repository: string;
  sonarQubeProjectKey: string;
  apiDependencies: ServiceApisDefinition;
};

export const SERVICEDEFINITIONS_FIELDS = [
  'name',
  'system'] as const;

export type ServiceDefinitionsListFields =
  | 'name'
  | 'system';

export type ServiceDefinitionsOptions = {
  field: ServiceDefinitionsListFields;
  direction: 'asc' | 'desc';
};

export type ServiceDefinitionsListRequest = {
  offset?: number,
  limit?: number,
  orderBy?: ServiceDefinitionsOptions,
  search?: string,
  ownership: OwnershipType;
  userEntityRef?: string | undefined;
};

// Systems

export type SystemDefinition = {
  entity: Entity;
  apis: string[];
  services: string[];
};

export const SYSTEMDEFINITIONS_FIELDS = [
  'name',
  'description',
  'owner'] as const;

export type SystemDefinitionsListFields =
  | 'name'
  | 'description'
  | 'owner';

export type SystemDefinitionsOptions = {
  field: SystemDefinitionsListFields;
  direction: 'asc' | 'desc';
};

export type OwnershipType = 'all' | 'owned';

export type SystemDefinitionsListRequest = {
  offset?: number;
  limit?: number;
  orderBy?: SystemDefinitionsOptions;
  search?: string;
  ownership: OwnershipType;
  userEntityRef?: string | undefined;
};

export type SystemDefinitionListResult = {
  items: Entity[];
  offset: number;
  limit: number;
  totalCount: number;
};

