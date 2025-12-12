import { LibraryDefinition } from '@internal/plugin-api-platform-common';
import * as XLSX from 'xlsx';
import { ApiPlatformBackendApi } from '../../api/ApiPlatformBackendApi';
import { fetchAllServices } from './fetchServicesByLibrary';

export async function generateReport(
  apiPlatformApi: ApiPlatformBackendApi,
  libraryName: string,
  libraryVersions: LibraryDefinition[] | undefined) {
  if (!libraryVersions) {
    throw new Error('No library versions to generate report');
  }

  const workbook = XLSX.utils.book_new();
  const allServices = (await fetchAllServices(apiPlatformApi)).items;

  for (const libVersion of libraryVersions) {
    const libRef = libVersion.entityRef.replace(/^component:default\//, '');
    const worksheetData = allServices.flatMap(service =>
      service.versions.flatMap(version => {
        return Object.entries(version.environments)
          .filter(([_, env]) => env?.dependencies?.includes(libRef))
          .map(([lifecycle, env]) => ({
            System: service.system || '-',
            ServiceName: service.serviceName || '-',
            ServiceVersion: version.version || '-',
            ImageVersion: env?.imageVersion || '-',
            Lifecycle: lifecycle || '-',
          }));
      }
      )
    );
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, `Version ${libVersion.version}`);
  }

  const xlsBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const blob = new Blob([xlsBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${libraryName}-report.xlsx`;
  a.click();

  window.URL.revokeObjectURL(url);
}
