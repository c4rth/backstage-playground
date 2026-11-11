import {
  LibraryDefinition,
  ServiceEnvironmentDefinitions,
} from '@internal/plugin-api-platform-common';
import { ApiPlatformBackendApi } from '../../api/ApiPlatformBackendApi';
import { fetchAllServices } from './fetchServicesByLibrary';
import { ApiPlatformTranslator } from '../../translation';

const ENVIRONMENTS = ['tst', 'gtu', 'uat', 'ptp', 'prd'] as const;

type Environment = (typeof ENVIRONMENTS)[number];

type ReportRow = {
  System: string;
  ServiceName: string;
  ServiceVersion: string;
} & Record<Uppercase<Environment>, string>;

const toLibRef = (entityRef: string) =>
  entityRef.replace(/^component:default\//, '');

const emptyEnvColumns = () =>
  Object.fromEntries(
    ENVIRONMENTS.map(env => [env.toUpperCase(), '-']),
  ) as Record<Uppercase<Environment>, string>;

const buildRow = (
  system: string,
  serviceName: string,
  serviceVersion: string,
): ReportRow => ({
  System: system || '-',
  ServiceName: serviceName || '-',
  ServiceVersion: serviceVersion || '-',
  ...emptyEnvColumns(),
});

const forEachEnvironment = (
  environments: ServiceEnvironmentDefinitions,
  callback: (
    env: Environment,
    envData: ServiceEnvironmentDefinitions[Environment],
  ) => void,
) => {
  ENVIRONMENTS.forEach(env => callback(env, environments[env]));
};

export async function generateReport(
  apiPlatformApi: ApiPlatformBackendApi,
  libraryName: string,
  libraryVersions: LibraryDefinition[] | undefined,
  t: ApiPlatformTranslator,
) {
  if (!libraryVersions) {
    throw new Error(t('report.noVersions'));
  }

  const XLSX = await import('xlsx');
  const allServices = (await fetchAllServices(apiPlatformApi, t)).items;
  const headers = [
    t('report.system'),
    t('report.serviceName'),
    t('report.serviceVersion'),
    ...ENVIRONMENTS.map(env => env.toUpperCase()),
  ];

  const createSheet = (data: ReportRow[], envColumnWidth: number) => {
    const sheet = XLSX.utils.json_to_sheet(data);
    if (data.length > 0) {
      XLSX.utils.sheet_add_aoa(sheet, [headers], { origin: 'A1' });
    }
    sheet['!cols'] = [
      { wch: 15 }, // System
      { wch: 30 }, // ServiceName
      { wch: 12 }, // ServiceVersion
      ...ENVIRONMENTS.map(() => ({ wch: envColumnWidth })),
    ];
    return sheet;
  };

  const workbook = XLSX.utils.book_new();

  // One sheet per library version, listing the services that use it
  for (const libVersion of libraryVersions) {
    const libRef = toLibRef(libVersion.entityRef);
    const worksheetData = allServices.flatMap(service =>
      service.versions.flatMap(version => {
        const row = buildRow(
          service.system,
          service.serviceName,
          version.version,
        );
        let usesLibrary = false;

        forEachEnvironment(version.environments, (env, envData) => {
          if (envData?.dependencies?.includes(libRef)) {
            usesLibrary = true;
            row[env.toUpperCase() as Uppercase<Environment>] =
              envData.imageVersion || '-';
          }
        });

        return usesLibrary ? [row] : [];
      }),
    );

    XLSX.utils.book_append_sheet(
      workbook,
      createSheet(worksheetData, 22),
      `${libVersion.version}`,
    );
  }

  // By-service sheet, showing which library version is used in each environment
  const libRefEntries = libraryVersions.map(lv => ({
    libRef: toLibRef(lv.entityRef),
    version: lv.version,
  }));

  const byServiceData = allServices
    .flatMap(service =>
      service.versions.map(version => {
        const row = buildRow(
          service.system,
          service.serviceName,
          version.version,
        );

        forEachEnvironment(version.environments, (env, envData) => {
          if (!envData?.dependencies) return;
          const deps = new Set(envData.dependencies);
          const match = libRefEntries.find(({ libRef }) => deps.has(libRef));
          if (match) {
            row[env.toUpperCase() as Uppercase<Environment>] =
              match.version || '-';
          }
        });

        return row;
      }),
    )
    .sort(
      (a, b) =>
        a.System.localeCompare(b.System) ||
        a.ServiceName.localeCompare(b.ServiceName),
    );

  XLSX.utils.book_append_sheet(
    workbook,
    createSheet(byServiceData, 15),
    t('report.byService'),
  );

  const xlsBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([xlsBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${libraryName}-report.xlsx`;
  a.click();

  window.URL.revokeObjectURL(url);
}
