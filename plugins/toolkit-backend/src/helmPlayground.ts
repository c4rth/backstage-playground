import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { InputError, ServiceUnavailableError } from '@backstage/errors';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import express from 'express';
import Router from 'express-promise-router';

const execute = promisify(execFile);
const maxInputBytes = 1024 * 1024;

function validateChartFiles(files: unknown): [string, string][] {
  if (!files || typeof files !== 'object' || Array.isArray(files)) {
    throw new InputError(
      'Chart files must be an object of filenames to contents',
    );
  }
  const entries = Object.entries(files);
  if (entries.length === 0 || entries.length > 100) {
    throw new InputError('Chart must contain between 1 and 100 files');
  }
  const result: [string, string][] = [];
  for (const [name, content] of entries) {
    if (
      name.length > 256 ||
      /[\\:]/.test(name) ||
      Array.from(name).some(character => character.charCodeAt(0) < 32) ||
      name.split('/').some(part => !part || part === '.' || part === '..')
    ) {
      throw new InputError(`Invalid chart filename: ${name}`);
    }
    if (typeof content !== 'string') {
      throw new InputError(`Chart file ${name} must contain a string`);
    }
    if (
      result.some(
        ([existing]) =>
          name.startsWith(`${existing}/`) || existing.startsWith(`${name}/`),
      )
    ) {
      throw new InputError(`Conflicting chart filename: ${name}`);
    }
    result.push([name, content]);
  }
  if (!result.some(([name]) => name === 'Chart.yaml')) {
    throw new InputError('Chart must include Chart.yaml');
  }
  return result;
}

export async function renderHelmChart(
  chartFiles: unknown,
  values: string,
): Promise<{ output: string; warnings: string }> {
  const files = validateChartFiles(chartFiles);
  const inputBytes = files.reduce(
    (size, [name, content]) =>
      size + Buffer.byteLength(name) + Buffer.byteLength(content),
    Buffer.byteLength(values),
  );
  if (inputBytes > maxInputBytes) {
    throw new InputError('Chart files and values exceed 1 MiB');
  }
  const directory = await mkdtemp(path.join(tmpdir(), 'helm-playground-'));
  try {
    const chartDirectory = path.join(directory, 'chart');
    for (const [name, content] of files) {
      const filename = path.join(chartDirectory, name);
      await mkdir(path.dirname(filename), { recursive: true });
      await writeFile(filename, content);
    }
    const valuesFilename = path.join(directory, 'values.yaml');
    await writeFile(valuesFilename, values);
    let result;
    try {
      result = await execute(
        'helm',
        [
          'template',
          'playground',
          chartDirectory,
          '--namespace',
          'default',
          '--values',
          valuesFilename,
          '--debug',
        ],
        {
          cwd: directory,
          timeout: 10_000,
          killSignal: 'SIGKILL',
          maxBuffer: 2 * 1024 * 1024,
          encoding: 'utf8',
          env: {
            PATH: process.env.PATH,
            HOME: directory,
            HELM_CACHE_HOME: path.join(directory, 'cache'),
            HELM_CONFIG_HOME: path.join(directory, 'config'),
            HELM_DATA_HOME: path.join(directory, 'data'),
            KUBECONFIG: path.join(directory, 'kubeconfig'),
          },
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        throw new ServiceUnavailableError(
          'Helm is not installed on the backend. Install Helm and ensure it is on PATH.',
        );
      }
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER'
      ) {
        throw new InputError('Helm output exceeds the 2 MiB limit');
      }
      if (error instanceof Error && 'killed' in error && error.killed) {
        throw new InputError('Helm rendering exceeded the 10 second limit');
      }
      if (
        error instanceof Error &&
        'code' in error &&
        typeof error.code === 'number' &&
        'stderr' in error &&
        typeof error.stderr === 'string'
      ) {
        throw new InputError(
          error.stderr.replaceAll(directory, '<playground>').trim() ||
            'Helm rendering failed',
        );
      }
      throw error;
    }
    return { output: result.stdout, warnings: result.stderr };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export const helmPlaygroundPlugin = createBackendPlugin({
  pluginId: 'toolkit',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
        logger: coreServices.logger,
      },
      async init({ httpRouter, httpAuth, logger }) {
        const router = Router();
        router.use(express.json({ limit: '1mb' }));
        let activeRenders = 0;
        router.post('/helm/render', async (req, res) => {
          await httpAuth.credentials(req, { allow: ['user'] });
          const body: unknown = req.body;
          if (
            !body ||
            typeof body !== 'object' ||
            !('files' in body) ||
            !('values' in body) ||
            typeof body.values !== 'string'
          ) {
            throw new InputError('Expected chart files and a values string');
          }
          if (activeRenders >= 2) {
            throw new ServiceUnavailableError(
              'Helm playground is busy. Please try again shortly.',
            );
          }
          activeRenders += 1;
          try {
            res.json(await renderHelmChart(body.files, body.values));
          } catch (error) {
            logger.warn('Helm playground rendering failed', {
              errorType: error instanceof Error ? error.name : typeof error,
            });
            throw error;
          } finally {
            activeRenders -= 1;
          }
        });
        httpRouter.use(router);
      },
    });
  },
});
