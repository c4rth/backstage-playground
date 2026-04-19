import { LibraryDefinition } from '@internal/plugin-api-platform-common';
import * as XLSX from 'xlsx';
import { ApiPlatformBackendApi } from '../../api/ApiPlatformBackendApi';
import { fetchAllServices } from './fetchServicesByLibrary';

export async function generateReport(
  apiPlatformApi: ApiPlatformBackendApi,
  libraryName: string,
  libraryVersions: LibraryDefinition[] | undefined,
) {
  if (!libraryVersions) {
    throw new Error('No library versions to generate report');
  }

  const workbook = XLSX.utils.book_new();
  const allServices = (await fetchAllServices(apiPlatformApi)).items;

  // By library version
  for (const libVersion of libraryVersions) {
    const libRef = libVersion.entityRef.replace(/^component:default\//, '');
    const worksheetData = allServices.flatMap(service =>
      service.versions
        .map(version => {
          // Check if any environment uses this library version
          const envs = Object.entries(version.environments).filter(([_, env]) =>
            env?.dependencies?.includes(libRef),
          );

          if (envs.length === 0) return null;

          // Build row with environment columns
          const row: any = {
            System: service.system || '-',
            ServiceName: service.serviceName || '-',
            ServiceVersion: version.version || '-',
          };

          // Add environment columns
          ['tst', 'gtu', 'uat', 'ptp', 'prd'].forEach(env => {
            const envData =
              version.environments[env as keyof typeof version.environments];
            const hasLibrary = envData?.dependencies?.includes(libRef);
            row[env.toUpperCase()] = hasLibrary
              ? envData?.imageVersion || '-'
              : '-';
          });

          return row;
        })
        .filter(row => row !== null),
    );

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 15 }, // System
      { wch: 30 }, // ServiceName
      { wch: 12 }, // ServiceVersion
      { wch: 22 }, // TST
      { wch: 22 }, // GTU
      { wch: 22 }, // UAT
      { wch: 22 }, // PTP
      { wch: 22 }, // PRD
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `${libraryName}-${libVersion.version}`,
    );
  }

  // By service - showing which library version is used in each environment
  const serviceMap = new Map<string, any>();

  // Pre-populate with all services
  allServices.forEach(service => {
    service.versions.forEach(version => {
      const serviceKey = `${service.system}|${service.serviceName}|${version.version}`;
      serviceMap.set(serviceKey, {
        System: service.system || '-',
        ServiceName: service.serviceName || '-',
        ServiceVersion: version.version || '-',
        TST: '-',
        GTU: '-',
        UAT: '-',
        PTP: '-',
        PRD: '-',
      });
    });
  });

  // Update with library versions where used
  allServices.forEach(service => {
    service.versions.forEach(version => {
      const serviceKey = `${service.system}|${service.serviceName}|${version.version}`;
      const row = serviceMap.get(serviceKey);

      Object.entries(version.environments).forEach(([env, envData]) => {
        if (!envData?.dependencies) return;

        // Check each dependency to find library version references
        const libVersionMatch = libraryVersions.find(lv => {
          const libRef = lv.entityRef.replace(/^component:default\//, '');
          return envData.dependencies.some(dep => dep === libRef);
        });

        if (libVersionMatch) {
          row[env.toUpperCase()] = libVersionMatch.version || '-';
        }
      });
    });
  });

  const byServiceData = Array.from(serviceMap.values()).sort((a, b) => {
    const systemCompare = (a.System || '').localeCompare(b.System || '');
    if (systemCompare !== 0) return systemCompare;
    return (a.ServiceName || '').localeCompare(b.ServiceName || '');
  });
  const byServiceSheet = XLSX.utils.json_to_sheet(byServiceData);

  byServiceSheet['!cols'] = [
    { wch: 15 }, // System
    { wch: 30 }, // ServiceName
    { wch: 12 }, // ServiceVersion
    { wch: 15 }, // TST
    { wch: 15 }, // GTU
    { wch: 15 }, // UAT
    { wch: 15 }, // PTP
    { wch: 15 }, // PRD
  ];

  XLSX.utils.book_append_sheet(workbook, byServiceSheet, 'By Service');

  const xlsBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });
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
