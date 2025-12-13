import {
  ServiceDefinitionListResult
} from "@internal/plugin-api-platform-common";
import { ApiPlatformBackendApi } from "../../api/ApiPlatformBackendApi";

export const fetchAllServicesByLibraryVersion = async (
    apiPlatformApi: ApiPlatformBackendApi,
    libraryVersionRef: string,
): Promise<ServiceDefinitionListResult> => {
    const result = await apiPlatformApi.listServices({
        ownership: 'all',
        dependsOn: libraryVersionRef,
    });
    return result ?? [];
};

export const fetchAllServices = async (
    apiPlatformApi: ApiPlatformBackendApi,
): Promise<ServiceDefinitionListResult> => {
    const result = await apiPlatformApi.listServices({
        ownership: 'all',
    });
    return result ?? [];
};