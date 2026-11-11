import * as XLSX from 'xlsx';
import { mockApis, renderInTestApp } from '@backstage/frontend-test-utils';
import { createElement } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import {
  createFrontendModule,
  createTranslationMessages,
  TranslationApi,
  translationApiRef,
} from '@backstage/frontend-plugin-api';
import { TranslationBlueprint } from '@backstage/plugin-app-react';
import {
  ServiceDefinition,
  LibraryDefinition,
} from '@internal/plugin-api-platform-common';
import {
  apiPlatformTranslationRef,
  ApiPlatformTranslator,
} from '../../translation';
import { generateReport } from './generateReport';
import { fetchAllServices } from './fetchServicesByLibrary';
import { getApiPlatformTranslator } from '../../api/translation';
import { ApiPlatformBackendClient } from '../../api';

jest.mock('xlsx', () => ({
  ...jest.requireActual('xlsx'),
  write: jest.fn(),
}));

let t: ApiPlatformTranslator;
const library: LibraryDefinition = {
  version: '1.2.3',
  entityRef: 'component:default/raw-library-v1.2.3',
  dependsOfCount: 1,
};
const service: ServiceDefinition = {
  name: 'raw-service',
  serviceName: 'raw-service',
  system: 'DEMO',
  owner: 'team',
  versions: [
    {
      version: '1',
      environments: {
        tst: {
          imageVersion: 'build-42',
          entityRef: 'component:default/raw-service',
          platform: 'cloud',
          dependencies: ['raw-library-v1.2.3'],
        },
      },
    },
  ],
};

function createApi() {
  const client = new ApiPlatformBackendClient({
    discoveryApi: mockApis.discovery(),
    fetchApi: mockApis.fetch.mock(),
    translationApi: mockApis.translation(),
  });
  const listServices = jest.spyOn(client, 'listServices').mockResolvedValue({
    items: [service],
    totalCount: 1,
    hasMore: false,
    offset: 0,
    limit: 20,
  });
  return { client, listServices };
}

beforeEach(async () => {
  jest.mocked(XLSX.write).mockClear();
  t = await getApiPlatformTranslator(mockApis.translation());
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: jest.fn().mockReturnValue('blob:report'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: jest.fn(),
  });
  jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

it('preserves report sheets, headings, data, and filename', async () => {
  const { client } = createApi();
  const write = jest.mocked(XLSX.write).mockReturnValue(new ArrayBuffer(0));
  await generateReport(client, 'raw-library', [library], t);
  const workbook = write.mock.calls[0][0];
  expect(workbook.SheetNames).toEqual(['1.2.3', 'By Service']);
  expect(
    XLSX.utils.sheet_to_json(workbook.Sheets['1.2.3'], { header: 1 }),
  ).toEqual([
    [
      'System',
      'ServiceName',
      'ServiceVersion',
      'TST',
      'GTU',
      'UAT',
      'PTP',
      'PRD',
    ],
    ['DEMO', 'raw-service', '1', 'build-42', '-', '-', '-', '-'],
  ]);
  expect(
    XLSX.utils.sheet_to_json(workbook.Sheets['By Service'], { header: 1 }),
  ).toEqual([
    [
      'System',
      'ServiceName',
      'ServiceVersion',
      'TST',
      'GTU',
      'UAT',
      'PTP',
      'PRD',
    ],
    ['DEMO', 'raw-service', '1', '1.2.3', '-', '-', '-', '-'],
  ]);
  const anchor = jest.mocked(HTMLAnchorElement.prototype.click).mock
    .instances[0];
  expect(anchor).toHaveProperty('download', 'raw-library-report.xlsx');
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:report');
});

it('translates report headings without changing rows or environment codes', async () => {
  let translationApi: TranslationApi | undefined;
  function CaptureApi() {
    translationApi = useApi(translationApiRef);
    return null;
  }
  renderInTestApp(createElement(CaptureApi), {
    features: [
      createFrontendModule({
        pluginId: 'app',
        extensions: [
          TranslationBlueprint.make({
            name: 'report-test',
            params: {
              resource: createTranslationMessages({
                ref: apiPlatformTranslationRef,
                messages: {
                  'report.system': 'Application',
                  'report.serviceName': 'Service',
                  'report.serviceVersion': 'Revision',
                  'report.byService': 'Service inventory',
                },
              }),
            },
          }),
        ],
      }),
    ],
  });
  if (!translationApi) {
    throw new Error('Translation API was not captured');
  }
  const override = await getApiPlatformTranslator(translationApi);
  const write = jest.mocked(XLSX.write).mockReturnValue(new ArrayBuffer(0));
  await generateReport(createApi().client, 'raw-library', [library], override);
  const workbook = write.mock.calls[0][0];
  expect(workbook.SheetNames).toEqual(['1.2.3', 'Service inventory']);
  expect(
    XLSX.utils.sheet_to_json(workbook.Sheets['Service inventory'], {
      header: 1,
    }),
  ).toEqual([
    ['Application', 'Service', 'Revision', 'TST', 'GTU', 'UAT', 'PTP', 'PRD'],
    ['DEMO', 'raw-service', '1', '1.2.3', '-', '-', '-', '-'],
  ]);
});

it('preserves empty sheets', async () => {
  const { client, listServices } = createApi();
  listServices.mockResolvedValue({
    items: [],
    totalCount: 0,
    hasMore: false,
    offset: 0,
    limit: 20,
  });
  const write = jest.mocked(XLSX.write).mockReturnValue(new ArrayBuffer(0));
  await generateReport(client, 'raw-library', [library], t);
  const workbook = write.mock.calls[0][0];
  expect(
    XLSX.utils.sheet_to_json(workbook.Sheets['1.2.3'], { header: 1 }),
  ).toEqual([[]]);
  expect(
    XLSX.utils.sheet_to_json(workbook.Sheets['By Service'], { header: 1 }),
  ).toEqual([[]]);
});

it('preserves missing-version and incomplete-pagination errors', async () => {
  const { client, listServices } = createApi();
  await expect(
    generateReport(client, 'raw-library', undefined, t),
  ).rejects.toThrow('No library versions to generate report');
  listServices.mockResolvedValue({
    items: [],
    totalCount: 2,
    hasMore: true,
    offset: 0,
    limit: 20,
  });
  await expect(fetchAllServices(client, t)).rejects.toThrow(
    'Service listing returned an empty page with more results available',
  );
});
