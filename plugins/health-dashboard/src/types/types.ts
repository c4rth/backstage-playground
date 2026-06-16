export type HealthProbe = {
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

export type HealthProbes = Record<string, HealthProbe>;

export type EnvironmentHealthData = Record<string, HealthProbes>;

export type ApplicationHealthData = {
  application: string;
  environments: Record<string, HealthProbe>;
};

export type HealthData = ApplicationHealthData[];

export type HealthDataSource = string;

export type HealthDataError = {
  source: HealthDataSource;
  message: string;
};

export type HealthDataResponse = {
  healthData: HealthData;
  errors: HealthDataError[];
};
