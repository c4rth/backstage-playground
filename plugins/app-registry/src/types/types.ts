import type { components } from "./appregistry-schema"; 

export type AppRegistryEndpoint = components["schemas"]["Endpoint"];

export type AppRegistryOperationPdpMapping = {
    valuePath: string;
    pdpField: string;
};

export type AppRegistryOperation = {
    method: string;
    name: string;
    abac: boolean;
    bFunction?: string;
    pdpMapping?: AppRegistryOperationPdpMapping[];
};