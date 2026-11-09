import { HealthV2Data, HealthV2Probe } from '../../types';
import {
  aggregateTechnicalStatus,
  buildHealthMatrix,
  getEnvironmentNames,
} from './healthMatrix';

function probe(
  application: string,
  platformComponent: string | null,
  environment: string,
  technicalStatus: string,
  component: string,
): HealthV2Probe {
  return {
    application,
    platformComponent,
    environment,
    technicalStatus,
    component,
    httpStatusCode: 200,
    response: null,
    executionTime: 0,
    timestamp: '',
    ip: null,
    region: null,
    downstreamStatus: '',
    functionalStatus: '',
    applicationType: '',
    platformService: null,
    healthProbeUrl: '',
    akscluster: null,
  };
}

describe('health matrix', () => {
  const first = probe('app', 'platform', 'TST', 'GREEN', 'a');
  const second = probe('app', 'other', 'TST', 'RED', 'a');
  const third = probe('app', 'platform', 'PRD', 'GREEN', 'a');
  const otherComponent = probe('app', 'platform', 'PRD', 'GREEN', 'b');
  const nullPlatform = probe('another', null, 'LAB', 'GREEN', 'e');
  const data: HealthV2Data = {
    TST: { group1: { a: first }, group2: { b: second } },
    PRD: { group1: { c: third, d: otherComponent } },
    LAB: { group: { e: nullPlatform } },
  };

  it('groups probes across environments without losing probes in the same environment', () => {
    expect(buildHealthMatrix(data, [])).toEqual([
      {
        id: JSON.stringify(['another', 'e']),
        application: 'another',
        component: 'e',
        environments: { LAB: [nullPlatform] },
      },
      {
        id: JSON.stringify(['app', 'a']),
        application: 'app',
        component: 'a',
        environments: { TST: [first, second], PRD: [third] },
      },
      {
        id: JSON.stringify(['app', 'b']),
        application: 'app',
        component: 'b',
        environments: { PRD: [otherComponent] },
      },
    ]);
  });

  it('filters applications while retaining all environments', () => {
    expect(buildHealthMatrix(data, ['app'])).toEqual([
      {
        id: JSON.stringify(['app', 'a']),
        application: 'app',
        component: 'a',
        environments: { TST: [first, second], PRD: [third] },
      },
      {
        id: JSON.stringify(['app', 'b']),
        application: 'app',
        component: 'b',
        environments: { PRD: [otherComponent] },
      },
    ]);
    expect(buildHealthMatrix(data, ['missing'])).toEqual([]);
  });

  it('includes multiple selected applications while excluding unselected ones', () => {
    const extra = probe('excluded', null, 'TST', 'GREEN', 'x');
    expect(
      buildHealthMatrix({ ...data, TST: { ...data.TST, extra: { extra } } }, [
        'app',
        'another',
      ]),
    ).toEqual(buildHealthMatrix(data, []));
  });

  it('includes extra environments after the standard columns', () => {
    expect(getEnvironmentNames(data)).toEqual([
      'TST',
      'GTU',
      'UAT',
      'PTP',
      'PRD',
      'LAB',
    ]);
  });

  it('prioritizes red, requires all green, and treats other statuses as unknown', () => {
    const unknown = probe('app', 'platform', 'TST', 'PENDING', 'x');
    expect(aggregateTechnicalStatus([first, second, unknown])).toBe('RED');
    expect(aggregateTechnicalStatus([first, third])).toBe('GREEN');
    expect(aggregateTechnicalStatus([first, unknown])).toBe('UNKNOWN');
    expect(aggregateTechnicalStatus([])).toBe('UNKNOWN');
    expect(
      aggregateTechnicalStatus([probe('app', null, 'TST', 'green', 'x')]),
    ).toBe('GREEN');
  });
});
