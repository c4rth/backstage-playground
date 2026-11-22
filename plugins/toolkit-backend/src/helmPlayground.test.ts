import {
  mockCredentials,
  startTestBackend,
} from '@backstage/backend-test-utils';
import { ChildProcess, execFile } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import request from 'supertest';
import helmPlaygroundPlugin from './index';
import { renderHelmChart } from './helmPlayground';

jest.mock('node:child_process', () => {
  const { promisify: actualPromisify } =
    jest.requireActual<typeof import('node:util')>('node:util');
  return {
    ...jest.requireActual<typeof import('node:child_process')>(
      'node:child_process',
    ),
    execFile: Object.assign(jest.fn(), {
      [actualPromisify.custom]: jest.fn(),
    }),
  };
});

const execute = jest.mocked(promisify(execFile));
const files = {
  'Chart.yaml': 'apiVersion: v2\nname: test\nversion: 0.1.0\n',
  'values.yaml': 'replicas: 1\n',
  'templates/deployment.yaml': 'replicas: {{ .Values.replicas }}\n',
};

describe('Helm rendering', () => {
  beforeEach(() => {
    execute.mockReset();
    execute.mockResolvedValue({ stdout: 'replicas: 3\n', stderr: '' });
  });

  it('writes the full chart and overrides, bounds execution, and cleans up', async () => {
    let directory = '';
    execute.mockImplementation((file, args, options) =>
      Object.assign(
        (async () => {
          expect(file).toBe('helm');
          directory = String(options?.cwd);
          expect(args).toEqual([
            'template',
            'playground',
            path.join(directory, 'chart'),
            '--namespace',
            'default',
            '--values',
            path.join(directory, 'values.yaml'),
            '--debug',
          ]);
          expect(options).toEqual(
            expect.objectContaining({
              timeout: 10_000,
              killSignal: 'SIGKILL',
              maxBuffer: 2 * 1024 * 1024,
            }),
          );
          expect(options?.env?.KUBECONFIG).toBe(
            path.join(directory, 'kubeconfig'),
          );
          expect(options?.env?.HELM_PLUGINS).toBeUndefined();
          expect(
            await readFile(
              path.join(directory, 'chart/templates/deployment.yaml'),
              'utf8',
            ),
          ).toBe('replicas: {{ .Values.replicas }}\n');
          expect(
            await readFile(path.join(directory, 'values.yaml'), 'utf8'),
          ).toBe('replicas: 3');
          return { stdout: 'replicas: 3\n', stderr: 'a warning' };
        })(),
        { child: new ChildProcess() },
      ),
    );

    await expect(renderHelmChart(files, 'replicas: 3')).resolves.toEqual({
      output: 'replicas: 3\n',
      warnings: 'a warning',
    });
    await expect(access(directory)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it.each([
    ['../outside', 'Invalid chart filename'],
    ['/outside', 'Invalid chart filename'],
    ['templates\\outside', 'Invalid chart filename'],
    ['templates/../outside', 'Invalid chart filename'],
    ['templates//outside', 'Invalid chart filename'],
    ['templates/./outside', 'Invalid chart filename'],
    ['templates/x:y', 'Invalid chart filename'],
    ['templates/\u0000outside', 'Invalid chart filename'],
  ])(
    'rejects unsafe filename %s before executing Helm',
    async (name, message) => {
      await expect(
        renderHelmChart({ ...files, [name]: 'test' }, ''),
      ).rejects.toThrow(message);
      expect(execute).not.toHaveBeenCalled();
    },
  );

  it.each([
    [null, 'must be an object'],
    ['Chart.yaml: test', 'must be an object'],
    [['Chart.yaml'], 'must be an object'],
    [{}, 'between 1 and 100 files'],
    [{ 'Chart.yaml': 123 }, 'must contain a string'],
    [{ ...files, 'Chart.yaml/nested': 'test' }, 'Conflicting chart filename'],
    [{ 'Chart.yaml/nested': 'test', ...files }, 'Conflicting chart filename'],
    [{ 'templates/test.yaml': 'test' }, 'must include Chart.yaml'],
    [{ 'Chart.yaml': 'x'.repeat(1024 * 1024) }, 'exceed 1 MiB'],
    [
      Object.fromEntries(
        Array.from({ length: 101 }, (_, index) => [`file-${index}`, 'test']),
      ),
      'between 1 and 100 files',
    ],
  ])('rejects invalid chart input', async (input, message) => {
    await expect(renderHelmChart(input, '')).rejects.toThrow(message);
    expect(execute).not.toHaveBeenCalled();
  });

  it('bounds the combined UTF-8 size of filenames, contents and overrides', async () => {
    await expect(
      renderHelmChart(files, 'é'.repeat(512 * 1024)),
    ).rejects.toThrow('exceed 1 MiB');
    expect(execute).not.toHaveBeenCalled();
  });

  it.each([
    [{ code: 'ENOENT' }, 'Helm is not installed'],
    [{ killed: true }, '10 second limit'],
    [
      { code: 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER', killed: true },
      '2 MiB limit',
    ],
    [{ code: 1, stderr: 'Error: invalid template' }, 'invalid template'],
  ])('surfaces Helm failures and cleans up', async (properties, message) => {
    execute.mockRejectedValue(
      Object.assign(new Error('exec failed'), properties),
    );
    await expect(renderHelmChart(files, '')).rejects.toThrow(message);
    const directory = String(execute.mock.calls[0][2]?.cwd);
    await expect(access(directory)).rejects.toMatchObject({ code: 'ENOENT' });
  });
});

describe('Helm playground endpoint', () => {
  beforeEach(() => {
    execute.mockReset();
    execute.mockResolvedValue({ stdout: 'replicas: 3\n', stderr: '' });
  });

  it('renders for authenticated users and rejects unauthenticated requests', async () => {
    const { server } = await startTestBackend({
      features: [helmPlaygroundPlugin],
    });
    const response = await request(server)
      .post('/api/toolkit/helm/render')
      .set('Authorization', mockCredentials.user.header())
      .send({ files, values: 'replicas: 3' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ output: 'replicas: 3\n', warnings: '' });

    const unauthenticated = await request(server)
      .post('/api/toolkit/helm/render')
      .set('Authorization', mockCredentials.none.header())
      .send({ files, values: '' });
    expect(unauthenticated.status).toBe(401);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('returns a useful error for malformed requests and templates', async () => {
    const { server } = await startTestBackend({
      features: [helmPlaygroundPlugin],
    });
    const malformed = await request(server)
      .post('/api/toolkit/helm/render')
      .send({ files, values: {} });
    expect(malformed.status).toBe(400);
    expect(execute).not.toHaveBeenCalled();

    execute.mockRejectedValue(
      Object.assign(new Error('exec failed'), {
        code: 1,
        stderr: 'Error: invalid template',
      }),
    );
    const invalid = await request(server)
      .post('/api/toolkit/helm/render')
      .send({ files, values: '' });
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.message).toContain('invalid template');
  });
});
