
export type DbServicesRow = {
  id: string;
  service: string;
  version: string;
  imageVersion: string;
  repository: string;
  sonarQubeProjectKey: string;
  providedApis?: string;
  consumedApis?: string;
  dependencies?: string;
};