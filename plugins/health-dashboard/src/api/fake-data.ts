import { EnvironmentHealthData, HealthProbe } from '../types';

const NON_PRD_CONFIG: Record<string, string[]> = {
  tst: [
    'AAAA',
    'A7K2',
    'M3P8',
    'Q9W1',
    'Z4N6',
    'B2T5',
    'H8R3',
    'L5C9',
    'V1D7',
    'N6X4',
    'R3F0',
    'C8M1',
    'P4L7',
    'T9Q2',
    'K6R4',
    'D2X9',
    'W1F3',
    'Y7N5',
    'G3V8',
    'J5S6',
    'U0H2',
    'E4K9',
    'S2B4',
    'F9T1',
    'X6P3',
    'I8D5',
    'O3W7',
    'R8L2',
    'B7Y0',
    'N1C6',
    'Q2M8',
  ],
  gtu: [
    'A7K2',
    'M3P8',
    'Q9W1',
    'Z4N6',
    'B2T5',
    'H8R3',
    'L5C9',
    'V1D7',
    'N6X4',
    'R3F0',
  ],
  uat: [
    'A7K2',
    'M3P8',
    'Q9W1',
    'Z4N6',
    'B2T5',
    'H8R3',
    'L5C9',
    'V1D7',
    'N6X4',
    'R3F0',
  ],
  ptp: [
    'A7K2',
    'M3P8',
    'Q9W1',
    'Z4N6',
    'B2T5',
    'H8R3',
    'L5C9',
    'V1D7',
    'N6X4',
    'R3F0',
  ],
};

const PRD_CONFIG: Record<string, string[]> = {
  prd: [
    'A7K2',
    'M3P8',
    'Q9W1',
    'Z4N6',
    'B2T5',
    'H8R3',
    'L5C9',
    'V1D7',
    'N6X4',
    'R3F0',
  ],
};

const HOSTS = [
  'alpha-grid.dev',
  'ops-lane.io',
  'skybridge.net',
  'red-harbor.com',
  'kitefield.org',
  'delta-farm.app',
  'corelane.tech',
  'orange-ridge.dev',
  'blue-crest.net',
  'peakline.cloud',
  'delta-circuit.net',
  'green-node.io',
  'sunharbor.dev',
  'silver-fleet.cloud',
  'redline.tech',
  'cloudframe.org',
  'ocean-grid.net',
  'prime-core.io',
  'crystal-net.dev',
  'nova-grid.dev',
  'horizon-lab.io',
  'iron-bridge.app',
  'steel-cloud.net',
  'lumen-core.org',
  'delta-harbor.dev',
  'quartz-grid.io',
  'sunfield.cloud',
  'skyline-node.tech',
  'blueforge.dev',
];

const PATH_SECTIONS = [
  'services',
  'apps',
  'tenant',
  'cluster',
  'runtime',
  'pods',
  'env',
  'health',
  'system',
  'sites',
];

function getRandomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomHex(length: number): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function formatDate(date: Date, separator: string): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}${separator}${month}${separator}${year} ${hours}:${minutes}:${seconds}`;
}

function generateRandomProbe(
  application: string,
  environment: string,
): HealthProbe {
  const now = new Date();
  const startedDate = new Date(
    now.getTime() - Math.floor(Math.random() * 24 * 60 * 60 * 1000),
  );

  const rand = Math.random();
  let status = 200;
  if (rand < 0.7) {
    status = 200;
  } else if (rand < 0.78) {
    status = 202;
  } else if (rand < 0.84) {
    status = 404;
  } else if (rand < 0.9) {
    status = 500;
  } else if (rand < 0.95) {
    status = 502;
  } else {
    status = 503;
  }

  let applicationStarted = false;
  if (status === 200) {
    applicationStarted = Math.random() < 0.85;
  } else if (status === 202) {
    applicationStarted = Math.random() < 0.5;
  }

  const host = getRandomElement(HOSTS);
  const path = getRandomElement(PATH_SECTIONS);
  const healthUrl = `https://${host}/${path}/${application.toLowerCase()}/actuator/health`;

  let statusObj: HealthProbe['status'];
  if (status === 200) {
    statusObj = {
      service: `Service OK (${environment.toUpperCase()})`,
      started: formatDate(startedDate, '/'),
      server: `svc-${application.toLowerCase()}-${getRandomHex(6)}-${getRandomHex(5)}`,
    };
  } else if (status === 202) {
    statusObj = {
      service: `Service Starting (${environment.toUpperCase()})`,
      started: formatDate(startedDate, '/'),
      server: `svc-${application.toLowerCase()}-${getRandomHex(6)}-${getRandomHex(5)}`,
    };
  } else if (status === 404) {
    statusObj = { errorMessage: '404 NOT_FOUND' };
  } else if (status === 500) {
    statusObj = { errorMessage: '500 INTERNAL_SERVER_ERROR' };
  } else if (status === 502) {
    statusObj = { errorMessage: '502 BAD_GATEWAY' };
  } else {
    statusObj = { errorMessage: '503 SERVICE_UNAVAILABLE' };
  }

  return {
    defl: application,
    lastRefresh: formatDate(now, '-'),
    applicationStarted,
    returnedHttpStatus: status,
    healthUrl,
    status: statusObj,
  };
}

function generateHealthData(
  envConfig: Record<string, string[]>,
): EnvironmentHealthData {
  const result: EnvironmentHealthData = {};
  for (const [env, apps] of Object.entries(envConfig)) {
    result[env] = {};
    for (const app of apps) {
      result[env][app] = generateRandomProbe(app, env);
    }
  }
  return result;
}

export const generateNonPrdData = (): EnvironmentHealthData =>
  generateHealthData(NON_PRD_CONFIG);

export const generatePrdData = (): EnvironmentHealthData =>
  generateHealthData(PRD_CONFIG);

export const nonPrdData = generateNonPrdData;
export const prdData = generatePrdData;

export function dummyCall(prd: boolean): EnvironmentHealthData {
  const data = prd ? prdData() : nonPrdData();
  return data;
}
