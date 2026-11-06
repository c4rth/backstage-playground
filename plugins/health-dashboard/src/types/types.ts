export type HealthV1Probe = {
  defl: string;
  lastRefresh: string;
  applicationStarted: boolean;
  returnedHttpStatus: number;
  healthUrl: string;
  status: {
    errorMessage?: string;
    [key: string]: any;
  };
};

// ------------------------------------------------------------------------------------------

export type HealthDataError = {
  source: string;
  message: string;
};

// ------------------------------------------------------------------------------------------

export type HealthV1Probes = Record<string, HealthV1Probe>;

export type EnvironmentHealthV1Data = Record<string, HealthV1Probes>;

export type ApplicationHealthV1Data = {
  application: string;
  environments: Record<string, HealthV1Probe>;
};

export type HealthV1Data = ApplicationHealthV1Data[];

export type HealthV1DataResponse = {
  healthData: HealthV1Data;
  errors: HealthDataError[];
};

// ------------------------------------------------------------------------------------------

export type HealthV2Probe = {
  application: string;
  component: string;
  httpStatusCode: number;
  response: string | null;
  executionTime: number;
  timestamp: string;
  environment: string;
  ip: string | null;
  region: string | null;
  downstreamStatus: string;
  functionalStatus: string;
  technicalStatus: string;
  applicationType: string;
  platformComponent: string | null;
  platformService: string | null;
  healthProbeUrl: string;
  akscluster: string | null;
};

export type HealthV2Data = Record<
  string,
  Record<string, Record<string, HealthV2Probe>>
>;

export type HealthV2DataResponse = {
  healthData: HealthV2Data;
  errors: HealthDataError[];
};
