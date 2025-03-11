
export type DbServicesRow = {
  applicationCode: string;
  service: string;
  version: string;
  imageVersion: string;
  repository: string;
  sonarQubeProjectKey: string;
  providedApis?: string;
  consumedApis?: string;
};