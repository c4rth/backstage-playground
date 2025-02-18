
export type DbServicesRow = {
    service: string;
    version: string;
    containerVersion: string;
    providedApis?: string;
    consumedApis?: string;
  };