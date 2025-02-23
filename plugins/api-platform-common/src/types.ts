import { Entity } from "@backstage/catalog-model";

export type ApiVersionDefinition = {
  entityRef: string;
  version: string;
  project: string;
};

export type ServiceEnvironmentDefinition = {
  containerVersion: string;
  containerName: string;
  entityRef: string;
}

export type ServiceVersionDefinition = {
  version: string;
  environments: {
    tst?: ServiceEnvironmentDefinition,
    gtu?: ServiceEnvironmentDefinition,
    uat?: ServiceEnvironmentDefinition,
    ptp?: ServiceEnvironmentDefinition,
    prd?: ServiceEnvironmentDefinition,
  };
}

export type ServiceDefinition = {
  name: string;
  owner: string;
  versions: ServiceVersionDefinition[];
};

export type ServiceApisDefinition = {
  consumedApis?: string[],
  providedApis?: string[],
}

export type SystemDefinition = {
  entity: Entity;
  apis: string[],
  services: string[]
};