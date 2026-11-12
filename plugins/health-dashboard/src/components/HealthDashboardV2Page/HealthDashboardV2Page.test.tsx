import { act, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useGetHealthV2Data } from '../../hooks';
import { HealthV2DataResponse, HealthV2Probe } from '../../types';
import { HealthDashboardV2Page } from './HealthDashboardV2Page';
import { mockApis, TestApiProvider } from '@backstage/frontend-test-utils';

jest.mock('../../hooks');
jest.mock('@internal/plugin-components-react', () => ({
  InformationPopup: () => null,
  InformationPopupContent: () => null,
  Progress: () => null,
  useDocumentTitle: () => {},
}));
jest.mock('../common/HealthDetailsSheet', () => ({
  HealthDetailsSheet: () => null,
}));
jest.mock('@backstage/core-components', () => ({
  ...jest.requireActual('@backstage/core-components'),
  ResponseErrorPanel: () => null,
}));
jest.mock('@backstage/ui', () => {
  const actual = jest.requireActual('@backstage/ui');
  return {
    ...actual,
    FullPage: ({ children }: { children: React.ReactNode }) => children,
    Header: ({ customActions }: { customActions: React.ReactNode }) =>
      customActions,
    Container: ({ children }: { children: React.ReactNode }) => children,
    Button: ({
      children,
      onClick,
      isDisabled,
    }: {
      children: React.ReactNode;
      onClick: () => void;
      isDisabled: boolean;
    }) => (
      <button disabled={isDisabled} onClick={onClick}>
        {children}
      </button>
    ),
    Select: ({
      value,
      options,
      onChange,
      selectionMode,
      'aria-label': ariaLabel,
    }: {
      value: string | string[];
      options: { id: string; label: string }[];
      onChange: (value: string | string[]) => void;
      selectionMode?: 'single' | 'multiple';
      'aria-label': string;
    }) => (
      <select
        aria-label={ariaLabel}
        multiple={selectionMode === 'multiple'}
        value={value}
        onChange={event => {
          onChange(
            selectionMode === 'multiple'
              ? Array.from(
                  event.target.selectedOptions,
                  option => option.value,
                )
              : event.target.value,
          );
        }}
      >
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    ),
    useTable: ({ data }: { data: unknown[] }) => ({
      tableProps: { data },
    }),
    Table: ({ data }: { data: { id: string; application: string }[] }) => (
      <ul>
        {data.map(row => (
          <li key={row.id}>{row.application}</li>
        ))}
      </ul>
    ),
  };
});

describe('HealthDashboardV2Page application URL filter', () => {
  let router: ReturnType<typeof createMemoryRouter>;
  const application = 'App & services/one';
  const response: HealthV2DataResponse = {
    healthData: {
      TST: {
        group: Object.fromEntries(
          [application, 'Other', 'Unselected'].map(name => [
            name,
            {
              application: name,
              component: 'component',
              environment: 'TST',
              technicalStatus: 'GREEN',
              httpStatusCode: 200,
              response: null,
              executionTime: 0,
              timestamp: '',
              ip: null,
              region: null,
              downstreamStatus: '',
              functionalStatus: '',
              applicationType: '',
              platformComponent: null,
              platformService: null,
              healthProbeUrl: '',
              akscluster: null,
            } satisfies HealthV2Probe,
          ]),
        ),
      },
    },
    errors: [],
  };
  const getHealthData = jest.fn().mockResolvedValue(response);

  beforeEach(() => {
    getHealthData.mockClear();
    jest.mocked(useGetHealthV2Data).mockReturnValue(getHealthData);
  });

  afterEach(() => {
    router.dispose();
  });

  async function renderPage(search = '') {
    router = createMemoryRouter(
      [{ path: '/health-dashboards/v2', element: <HealthDashboardV2Page /> }],
      { initialEntries: [`/health-dashboards/v2${search}`] },
    );
    render(
      <TestApiProvider apis={[mockApis.translation(), mockApis.error()]}>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </TestApiProvider>,
    );
    await screen.findByRole('option', { name: application });
  }

  function selectedApplication() {
    return screen.getByRole<HTMLSelectElement>('listbox').value;
  }

  function applications() {
    return screen.getAllByRole('listitem').map(row => row.textContent);
  }

  async function selectApplication(...values: string[]) {
    await act(async () => {
      const select = screen.getByRole<HTMLSelectElement>('listbox');
      Array.from(select.options).forEach(option => {
        option.selected = values.includes(option.value);
      });
      fireEvent.change(select);
    });
  }

  it('restores a bookmarked application after loading data', async () => {
    await renderPage(`?application=${encodeURIComponent(application)}`);

    expect(selectedApplication()).toBe(application);
    expect(applications()).toEqual([application]);
  });

  it('defaults to all applications without a query parameter', async () => {
    await renderPage();

    expect(selectedApplication()).toBe('All');
    expect(applications()).toEqual([application, 'Other', 'Unselected']);
    expect(router.state.location.search).toBe('');
  });

  it('updates the URL, preserves other parameters, and supports back/forward', async () => {
    await renderPage('?view=compact');
    await selectApplication('All', application);

    const params = new URLSearchParams(router.state.location.search);
    expect(params.get('application')).toBe(application);
    expect(params.get('view')).toBe('compact');
    expect(applications()).toEqual([application]);

    await selectApplication(application, 'Other');
    const multipleParams = new URLSearchParams(router.state.location.search);
    expect(multipleParams.getAll('application')).toEqual([
      `${application},Other`,
    ]);
    expect(multipleParams.get('view')).toBe('compact');
    expect(applications()).toEqual([application, 'Other']);

    await selectApplication('All', application, 'Other');
    expect(router.state.location.search).toBe('?view=compact');
    expect(applications()).toEqual([application, 'Other', 'Unselected']);

    await act(async () => router.navigate(-1));
    expect(selectedApplication()).toBe(application);
    expect(applications()).toEqual([application, 'Other']);

    await act(async () => router.navigate(1));
    expect(selectedApplication()).toBe('All');
    expect(applications()).toEqual([application, 'Other', 'Unselected']);
  });

  it('restores multiple applications from a comma-separated URL', async () => {
    await renderPage(
      `?application=${encodeURIComponent(`${application},Other`)}`,
    );

    expect(
      Array.from(
        screen.getByRole<HTMLSelectElement>('listbox').selectedOptions,
        option => option.value,
      ),
    ).toEqual([application, 'Other']);
    expect(applications()).toEqual([application, 'Other']);
  });

  it('deselects applications and resets to all after deselecting the last one', async () => {
    await renderPage(
      `?view=compact&application=${encodeURIComponent(`${application},Other`)}`,
    );

    await selectApplication('Other');
    expect(applications()).toEqual(['Other']);
    expect(
      new URLSearchParams(router.state.location.search).get('application'),
    ).toBe('Other');

    await selectApplication();
    expect(applications()).toEqual([application, 'Other', 'Unselected']);
    expect(selectedApplication()).toBe('All');
    expect(router.state.location.search).toBe('?view=compact');
  });

  it('resets to all when the selection is cleared', async () => {
    await renderPage(`?application=${encodeURIComponent(application)}`);
    await selectApplication();

    expect(selectedApplication()).toBe('All');
    expect(applications()).toEqual([application, 'Other', 'Unselected']);
    expect(router.state.location.search).toBe('');
  });

  it('refreshes health data when the refresh button is pressed', async () => {
    await renderPage();

    expect(getHealthData).toHaveBeenCalledTimes(1);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    });

    expect(getHealthData).toHaveBeenCalledTimes(2);
  });
});
