import {
  ServiceDefinitionListResult
} from "@internal/plugin-api-platform-common";
import { ApiPlatformBackendApi } from "../../api/ApiPlatformBackendApi";

export const fetchAllServicesByLibrary = async (
    apiPlatformApi: ApiPlatformBackendApi,
    libraryName: string,
): Promise<ServiceDefinitionListResult> => {
    const result = await apiPlatformApi.listServices({
        ownership: 'all',
        dependsOn: libraryName,
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