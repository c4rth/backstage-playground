import { HealthV2Data, HealthV2Probe } from '../../types';

export const ENVIRONMENTS = ['TST', 'GTU', 'UAT', 'PTP', 'PRD'];

export type HealthV2MatrixRow = {
  id: string;
  application: string;
  component: string | null;
  environments: Record<string, HealthV2Probe[]>;
};

export type HealthV2ApplicationGroup = {
  application: string;
  components: HealthV2MatrixRow[];
};

export function groupHealthMatrix(
  rows: HealthV2MatrixRow[],
): HealthV2ApplicationGroup[] {
  const groups = new Map<string, HealthV2ApplicationGroup>();
  for (const row of rows) {
    let group = groups.get(row.application);
    if (!group) {
      group = {
        application: row.application,
        components: [],
      };
      groups.set(row.application, group);
    }
    group.components.push(row);
  }
  return [...groups.values()];
}

export function getEnvironmentNames(data: HealthV2Data): string[] {
  const additional = Object.keys(data)
    .filter(environment => !ENVIRONMENTS.includes(environment))
    .sort((a, b) => a.localeCompare(b));
  return [...ENVIRONMENTS, ...additional];
}

export function buildHealthMatrix(
  data: HealthV2Data,
  selectedApplications: readonly string[],
): HealthV2MatrixRow[] {
  const rows = new Map<string, HealthV2MatrixRow>();
  for (const [environment, groups] of Object.entries(data)) {
    for (const probes of Object.values(groups)) {
      for (const probe of Object.values(probes)) {
        if (
          selectedApplications.length > 0 &&
          !selectedApplications.includes(probe.application)
        ) {
          continue;
        }
        const id = JSON.stringify([probe.application, probe.component]);
        let row = rows.get(id);
        if (!row) {
          row = {
            id,
            application: probe.application,
            component: probe.component,
            environments: {},
          };
          rows.set(id, row);
        }
        (row.environments[environment] ??= []).push(probe);
      }
    }
  }
  return [...rows.values()].sort(
    (a, b) =>
      a.application.localeCompare(b.application) ||
      (a.component ?? '').localeCompare(b.component ?? ''),
  );
}

export function aggregateTechnicalStatus(
  probes: HealthV2Probe[],
): 'RED' | 'GREEN' | 'UNKNOWN' {
  if (probes.some(probe => probe.technicalStatus.toUpperCase() === 'RED')) {
    return 'RED';
  }
  if (
    probes.length > 0 &&
    probes.every(probe => probe.technicalStatus.toUpperCase() === 'GREEN')
  ) {
    return 'GREEN';
  }
  return 'UNKNOWN';
}
