import { mockApis, renderTestApp } from '@backstage/frontend-test-utils';
import { screen } from '@testing-library/react';
import { createHealthDashboardPlugin } from './plugin';

jest.mock('./components/HealthDashboardV1Page', () => ({
  HealthDashboardV1Page: () => <div>V1 dashboard content</div>,
}));
jest.mock('./components/HealthDashboardV2Page', () => ({
  HealthDashboardV2Page: () => <div>V2 dashboard content</div>,
}));

describe('health dashboard configuration', () => {
  it.each([
    [{}, 'V1 dashboard content', true, true],
    [{ v1: { enabled: false } }, 'V2 dashboard content', false, true],
    [{ v2: { enabled: false } }, 'V1 dashboard content', true, false],
    [
      { v1: { enabled: true }, v2: { enabled: true } },
      'V1 dashboard content',
      true,
      true,
    ],
  ])(
    'registers the enabled dashboards for %j',
    async (healthProbes, firstContent, v1Enabled, v2Enabled) => {
      const config = mockApis.config({ data: { healthProbes } });
      renderTestApp({
        features: [createHealthDashboardPlugin(config)],
        initialRouteEntries: ['/health-dashboards'],
      });

      expect(await screen.findByText(firstContent)).toBeTruthy();
      expect(
        Boolean(screen.queryByRole('tab', { name: 'Health Dashboards V1' })),
      ).toBe(v1Enabled);
      expect(
        Boolean(screen.queryByRole('tab', { name: 'Health Dashboards V2' })),
      ).toBe(v2Enabled);
    },
  );

  it.each([
    ['v1', { v1: { enabled: false } }, 'Health Dashboards V2', 'V1'],
    ['v2', { v2: { enabled: false } }, 'Health Dashboards V1', 'V2'],
  ])(
    'does not render a disabled %s dashboard at its direct URL',
    async (version, healthProbes, enabledTab, disabledVersion) => {
      const config = mockApis.config({ data: { healthProbes } });
      renderTestApp({
        features: [createHealthDashboardPlugin(config)],
        initialRouteEntries: [`/health-dashboards/${version}`],
      });

      expect(await screen.findByRole('tab', { name: enabledTab })).toBeTruthy();
      expect(screen.queryByText(`${disabledVersion} dashboard content`)).toBeNull();
    },
  );

  it('omits the parent page when both dashboards are disabled', () => {
    const config = mockApis.config({
      data: { healthProbes: { v1: { enabled: false }, v2: { enabled: false } } },
    });
    const plugin = createHealthDashboardPlugin(config);

    expect(() =>
      plugin.getExtension('page:health-dashboards/dashboard-explorer'),
    ).toThrow();
  });
});
