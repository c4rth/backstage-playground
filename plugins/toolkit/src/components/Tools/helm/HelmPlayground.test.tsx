import { coreApis } from '@backstage/frontend-plugin-api';
import { mockApis, renderInTestApp } from '@backstage/frontend-test-utils';
import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { EditorView } from '@codemirror/view';
import HelmPlayground from './HelmPlayground';
import { sampleFiles, sampleValues } from './sample';

describe('Helm playground', () => {
  const fetchApi = mockApis.fetch.mock();
  const originalCSS = Object.getOwnPropertyDescriptor(globalThis, 'CSS');

  beforeAll(() => {
    Object.defineProperty(globalThis, 'CSS', {
      configurable: true,
      value: { escape: (value: string) => value },
    });
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value: () => [],
    });
    Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(),
    });
  });

  afterAll(() => {
    if (originalCSS) {
      Object.defineProperty(globalThis, 'CSS', originalCSS);
    } else {
      Reflect.deleteProperty(globalThis, 'CSS');
    }
    Reflect.deleteProperty(Range.prototype, 'getClientRects');
    Reflect.deleteProperty(Range.prototype, 'getBoundingClientRect');
  });

  beforeEach(() => {
    fetchApi.fetch.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function renderPlayground(loadSample = true) {
    const result = renderInTestApp(<HelmPlayground />, {
      apis: [
        [coreApis.fetch, fetchApi],
        [
          coreApis.discovery,
          mockApis.discovery({ baseUrl: 'http://localhost:7007' }),
        ],
        [
          coreApis.appTheme,
          mockApis.appTheme({
            activeThemeId: 'light',
            themes: [
              {
                id: 'light',
                title: 'Light',
                variant: 'light',
                Provider: ({ children }) => <>{children}</>,
              },
            ],
          }),
        ],
      ],
    });
    const sampleButton = await screen.findByRole('button', { name: 'Sample' });
    if (loadSample) {
      fireEvent.click(sampleButton);
      await waitFor(() =>
        expect(
          screen.getByRole('textbox', { name: 'Chart file contents' })
            .textContent,
        ).toContain('kind: Deployment'),
      );
    }
    return result;
  }

  function replaceContent(label: string, content: string) {
    const editor = EditorView.findFromDOM(
      screen.getByRole('textbox', { name: label }),
    );
    if (!editor) {
      throw new Error(`${label} editor was not initialized`);
    }
    act(() => {
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: content },
      });
    });
  }

  function getFilePicker() {
    return screen.getByRole<HTMLButtonElement>('button', {
      name: /Chart files/,
    });
  }

  async function openFilePicker() {
    fireEvent.click(getFilePicker());
    return screen.findByRole('listbox');
  }

  async function selectFile(name: string) {
    await openFilePicker();
    fireEvent.click(await screen.findByRole('option', { name }));
    await waitFor(() => expect(getFilePicker().textContent).toBe(name));
  }

  it('renders only on demand, sends both inputs, and displays read-only output', async () => {
    fetchApi.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({ output: 'kind: Deployment\n', warnings: '' }),
        { status: 200 },
      ),
    );
    await renderPlayground();
    expect(fetchApi.fetch).not.toHaveBeenCalled();
    for (const label of [
      'Helm chart',
      'Values overrides (YAML)',
      'Rendered manifests',
    ]) {
      expect(screen.queryByText(label, { exact: true })).toBeNull();
      expect(screen.getByRole('region', { name: label })).not.toBeNull();
    }

    fireEvent.click(await screen.findByRole('button', { name: 'Render' }));
    await waitFor(() => expect(fetchApi.fetch).toHaveBeenCalledTimes(1));
    expect(fetchApi.fetch).toHaveBeenCalledWith(
      'http://localhost:7007/api/toolkit/helm/render',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ files: sampleFiles, values: sampleValues }),
      }),
    );
    const output = screen.getByRole('textbox', { name: 'Rendered manifests' });
    await waitFor(() =>
      expect(output.textContent).toContain('kind: Deployment'),
    );
    expect(output.getAttribute('contenteditable')).toBe('false');
  });

  it('shows backend errors in the manifests editor and replaces them after a successful render', async () => {
    fetchApi.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { name: 'InputError', message: 'Invalid template' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    await renderPlayground();
    fireEvent.click(await screen.findByRole('button', { name: 'Render' }));
    const alert = await screen.findByRole('alert');
    const output = screen.getByRole('textbox', { name: 'Rendered manifests' });
    expect(alert.contains(output)).toBe(true);
    await waitFor(() =>
      expect(output.textContent).toContain('Invalid template'),
    );
    expect(output.getAttribute('contenteditable')).toBe('false');

    fetchApi.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({ output: 'kind: Deployment\n', warnings: '' }),
        { status: 200 },
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Render' }));
    await waitFor(() =>
      expect(output.textContent).toContain('kind: Deployment'),
    );
    expect(output.textContent).not.toContain('Invalid template');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it.each(['Values overrides (YAML)', 'Chart file contents'])(
    'discards a pending result when %s changes and reloads the sample',
    async label => {
      let finish: (response: Response) => void = () => {
        throw new Error('Render request has not started');
      };
      fetchApi.fetch.mockImplementation(
        () =>
          new Promise<Response>(resolve => {
            finish = resolve;
          }),
      );
      await renderPlayground();
      fireEvent.click(await screen.findByRole('button', { name: 'Render' }));
      await waitFor(() => expect(fetchApi.fetch).toHaveBeenCalledTimes(1));

      replaceContent(label, 'replicaCount: 5');
      await act(async () => {
        finish(
          new Response(
            JSON.stringify({ output: 'stale output', warnings: '' }),
          ),
        );
      });
      expect(
        screen.getByRole('textbox', { name: 'Rendered manifests' }).textContent,
      ).toBe('');
      expect(
        screen.getByRole('button', { name: 'Render' }).hasAttribute('disabled'),
      ).toBe(false);

      fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
      await waitFor(() => {
        expect(
          screen.getByRole('textbox', { name: 'Chart file contents' })
            .textContent,
        ).toContain('apiVersion: v2');
        expect(
          screen.getByRole('textbox', { name: 'Values overrides (YAML)' })
            .textContent,
        ).toBe('');
      });
      expect(
        screen.getByRole('button', { name: 'Render' }).hasAttribute('disabled'),
      ).toBe(true);
      expect(getFilePicker().textContent).toBe('Chart.yaml');
      expect(getFilePicker().disabled).toBe(false);
      fireEvent.click(screen.getByRole('button', { name: 'Sample' }));
      await waitFor(() => {
        expect(
          screen.getByRole('textbox', { name: 'Chart file contents' })
            .textContent,
        ).toContain('kind: Deployment');
        expect(
          screen.getByRole('textbox', { name: 'Values overrides (YAML)' })
            .textContent,
        ).toContain('replicaCount: 1');
      });
    },
  );

  it('resizes both editor splits with the JSONata limits without changing inputs', async () => {
    await renderPlayground();
    const horizontal = screen.getByLabelText('Resize horizontal divider');
    const vertical = screen.getByLabelText('Resize vertical divider');
    const main = horizontal.parentElement;
    const right = vertical.parentElement;
    if (!main || !right) {
      throw new Error('Resizable editor containers were not initialized');
    }
    jest
      .spyOn(main, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 1000, 600));
    jest
      .spyOn(right, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 500, 600));

    fireEvent.mouseDown(horizontal);
    fireEvent.mouseMove(window, { clientX: 700 });
    expect(main.style.gridTemplateColumns).toBe('70% 2px minmax(0, 1fr)');
    fireEvent.mouseMove(window, { clientX: 0 });
    expect(main.style.gridTemplateColumns).toBe('15% 2px minmax(0, 1fr)');
    fireEvent.mouseUp(window);

    fireEvent.mouseDown(vertical);
    fireEvent.mouseMove(window, { clientY: 240 });
    expect(right.style.gridTemplateRows).toBe('40% 2px minmax(0, 1fr)');
    fireEvent.mouseMove(window, { clientY: 600 });
    expect(right.style.gridTemplateRows).toBe('50% 2px minmax(0, 1fr)');
    fireEvent.mouseUp(window);
    fireEvent.mouseMove(window, { clientY: 60 });
    expect(right.style.gridTemplateRows).toBe('50% 2px minmax(0, 1fr)');

    const chartEditor = EditorView.findFromDOM(
      screen.getByRole('textbox', { name: 'Chart file contents' }),
    );
    const valuesEditor = EditorView.findFromDOM(
      screen.getByRole('textbox', { name: 'Values overrides (YAML)' }),
    );
    expect(chartEditor?.state.doc.toString()).toBe(
      sampleFiles['templates/deployment.yaml'],
    );
    expect(valuesEditor?.state.doc.toString()).toBe(sampleValues);
    expect(fetchApi.fetch).not.toHaveBeenCalled();
  });

  it('preserves individual file edits across navigation and sends every file with independent overrides', async () => {
    fetchApi.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({ output: 'kind: ConfigMap\n', warnings: '' }),
      ),
    );
    await renderPlayground();
    const editedTemplate = 'apiVersion: v1\nkind: ConfigMap\n';
    await selectFile('templates/deployment.yaml');
    await waitFor(() =>
      expect(
        screen.getByRole('textbox', { name: 'Chart file contents' })
          .textContent,
      ).toContain('kind: Deployment'),
    );
    replaceContent('Chart file contents', editedTemplate);
    await selectFile('templates/service.yaml');
    await waitFor(() =>
      expect(
        screen.getByRole('textbox', { name: 'Chart file contents' })
          .textContent,
      ).toContain('kind: Service'),
    );
    await selectFile('templates/deployment.yaml');
    await waitFor(() =>
      expect(
        EditorView.findFromDOM(
          screen.getByRole('textbox', { name: 'Chart file contents' }),
        )?.state.doc.toString(),
      ).toBe(editedTemplate),
    );
    replaceContent('Values overrides (YAML)', 'replicaCount: 9\n');
    await selectFile('Chart.yaml');
    const editedChart = sampleFiles['Chart.yaml'].replace(
      'name: hello-world',
      'name: playground',
    );
    replaceContent('Chart file contents', editedChart);
    fireEvent.click(screen.getByRole('button', { name: 'Render' }));
    await waitFor(() => expect(fetchApi.fetch).toHaveBeenCalledTimes(1));
    expect(fetchApi.fetch.mock.calls[0][1]?.body).toBe(
      JSON.stringify({
        files: {
          ...sampleFiles,
          'Chart.yaml': editedChart,
          'templates/deployment.yaml': editedTemplate,
        },
        values: 'replicaCount: 9\n',
      }),
    );
  });

  it('creates nested files, renames without losing contents, and confirms deletion', async () => {
    await renderPlayground();
    for (const name of ['New file', 'Rename', 'Delete']) {
      expect(screen.getByRole('button', { name }).textContent).toBe('');
    }
    fireEvent.click(screen.getByRole('button', { name: 'New file' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Filename' }), {
      target: { value: 'tests/custom.yaml' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create file' }));
    await waitFor(() =>
      expect(getFilePicker().textContent).toBe('templates/tests/custom.yaml'),
    );
    replaceContent('Chart file contents', 'kind: ConfigMap\n');

    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Filename' }), {
      target: { value: 'templates/custom-renamed.yaml' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Rename file' }));
    await waitFor(() =>
      expect(getFilePicker().textContent).toBe('templates/custom-renamed.yaml'),
    );
    expect(
      EditorView.findFromDOM(
        screen.getByRole('textbox', { name: 'Chart file contents' }),
      )?.state.doc.toString(),
    ).toBe('kind: ConfigMap\n');

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(getFilePicker().textContent).toBe('templates/custom-renamed.yaml'),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete file' }));
    await waitFor(() =>
      expect(getFilePicker().textContent).toBe('templates/deployment.yaml'),
    );
    const options = await openFilePicker();
    expect(
      within(options).queryByRole('option', {
        name: 'templates/tests/custom.yaml',
      }),
    ).toBeNull();
    expect(
      within(options).queryByRole('option', {
        name: 'templates/custom-renamed.yaml',
      }),
    ).toBeNull();
  });

  it('rejects traversal, duplicate names and file/folder conflicts without overwriting files', async () => {
    await renderPlayground();
    fireEvent.click(screen.getByRole('button', { name: 'New file' }));
    for (const [name, message] of [
      ['', 'Enter a relative filename'],
      ['../outside.yaml', 'Enter a relative filename'],
      ['/outside.yaml', 'Enter a relative filename'],
      ['deployment.yaml', 'A file with this name already exists.'],
      ['templates/deployment.yaml', 'A file with this name already exists.'],
      [
        'deployment.yaml/nested.yaml',
        'This path conflicts with an existing file or folder.',
      ],
    ]) {
      fireEvent.change(screen.getByRole('textbox', { name: 'Filename' }), {
        target: { value: name },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Create file' }));
      expect((await screen.findByRole('alert')).textContent).toContain(message);
    }
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Filename' }), {
      target: { value: 'values.yaml' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Rename file' }));
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Use Chart.yaml or a file inside the templates/ directory.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(getFilePicker().textContent).toBe('templates/deployment.yaml'),
    );
    expect(
      EditorView.findFromDOM(
        screen.getByRole('textbox', { name: 'Chart file contents' }),
      )?.state.doc.toString(),
    ).toBe(sampleFiles['templates/deployment.yaml']);
    const options = await openFilePicker();
    expect(within(options).getAllByRole('option')).toHaveLength(
      Object.keys(sampleFiles).filter(
        name => name === 'Chart.yaml' || name.startsWith('templates/'),
      ).length,
    );
  });

  it('uses a non-searchable dropdown with full chart paths while preserving the selected file contents', async () => {
    await renderPlayground();
    expect(getFilePicker().textContent).toBe('templates/deployment.yaml');
    expect(screen.queryByRole('combobox')).toBeNull();
    const chartEditor = EditorView.findFromDOM(
      screen.getByRole('textbox', { name: 'Chart file contents' }),
    );
    await openFilePicker();
    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(
      screen.getAllByRole('option').map(option => option.textContent),
    ).toEqual(
      Object.keys(sampleFiles)
        .filter(name => name === 'Chart.yaml' || name.startsWith('templates/'))
        .sort(),
    );
    expect(chartEditor?.state.doc.toString()).toBe(
      sampleFiles['templates/deployment.yaml'],
    );
    fireEvent.click(
      screen.getByRole('option', { name: 'templates/service.yaml' }),
    );
    await waitFor(() =>
      expect(getFilePicker().textContent).toBe('templates/service.yaml'),
    );
    expect(
      EditorView.findFromDOM(
        screen.getByRole('textbox', { name: 'Chart file contents' }),
      )?.state.doc.toString(),
    ).toBe(sampleFiles['templates/service.yaml']);
    expect(fetchApi.fetch).not.toHaveBeenCalled();
  });

  it('offers Chart.yaml and full template paths, keeping default values hidden', async () => {
    await renderPlayground();
    const options = await openFilePicker();
    expect(
      within(options)
        .getAllByRole('option')
        .map(option => option.textContent),
    ).toEqual(
      Object.keys(sampleFiles)
        .filter(name => name === 'Chart.yaml' || name.startsWith('templates/'))
        .sort(),
    );
    expect(
      within(options).queryByRole('option', { name: 'Chart.yaml' }),
    ).not.toBeNull();
    expect(
      within(options).queryByRole('option', { name: 'values.yaml' }),
    ).toBeNull();
  });

  it('renders a new template with default chart metadata and disables rendering after the last template is deleted', async () => {
    fetchApi.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({ output: 'kind: ConfigMap\n', warnings: '' }),
      ),
    );
    await renderPlayground(false);
    expect(getFilePicker().disabled).toBe(false);
    expect(getFilePicker().textContent).toBe('Chart.yaml');
    expect(
      screen.getByRole('button', { name: 'Render' }).hasAttribute('disabled'),
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'New file' }));
    expect(
      screen.getByRole<HTMLInputElement>('textbox', { name: 'Filename' }).value,
    ).toBe('');
    fireEvent.change(screen.getByRole('textbox', { name: 'Filename' }), {
      target: { value: 'configmap.yaml' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create file' }));
    await waitFor(() =>
      expect(getFilePicker().textContent).toBe('templates/configmap.yaml'),
    );
    const template =
      'apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: test\n';
    replaceContent('Chart file contents', template);
    fireEvent.click(screen.getByRole('button', { name: 'Render' }));
    await waitFor(() => expect(fetchApi.fetch).toHaveBeenCalledTimes(1));
    expect(fetchApi.fetch.mock.calls[0][1]?.body).toBe(
      JSON.stringify({
        files: {
          'Chart.yaml': sampleFiles['Chart.yaml'],
          'values.yaml': sampleFiles['values.yaml'],
          'templates/configmap.yaml': template,
        },
        values: '',
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete file' }));
    await waitFor(() => expect(getFilePicker().textContent).toBe('Chart.yaml'));
    expect(getFilePicker().disabled).toBe(false);
    expect(
      screen.getByRole('button', { name: 'Render' }).hasAttribute('disabled'),
    ).toBe(true);
  });

  it('adds a file named Chart.yaml inside templates without overwriting chart metadata', async () => {
    fetchApi.fetch.mockResolvedValue(
      new Response(JSON.stringify({ output: '', warnings: '' })),
    );
    await renderPlayground();
    fireEvent.click(screen.getByRole('button', { name: 'New file' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Filename' }), {
      target: { value: 'Chart.yaml' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create file' }));
    await waitFor(() =>
      expect(getFilePicker().textContent).toBe('templates/Chart.yaml'),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Render' }));
    await waitFor(() => expect(fetchApi.fetch).toHaveBeenCalledTimes(1));
    expect(fetchApi.fetch.mock.calls[0][1]?.body).toBe(
      JSON.stringify({
        files: { ...sampleFiles, 'templates/Chart.yaml': '' },
        values: sampleValues,
      }),
    );
  });
});
