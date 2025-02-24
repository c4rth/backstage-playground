
export type DbServicesRow = {
  applicationCode: string;
  service: string;
  version: string;
  containerName: string;
  containerVersion: string;
  repository: string;
  sonarQubeProjectKey: string;
  providedApis?: string;
  consumedApis?: string;
};