import { readdir, stat } from 'fs-extra';
import { join, relative } from 'path';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { examples } from './log.examples';
import fs from 'fs';
import { LoggerService } from '@backstage/backend-plugin-api';

const id = 'debugx:log';

/**
 * Writes a message into the log or lists all files in the workspace
 *
 * @remarks
 *
 * This task is useful for local development and testing of both the scaffolder
 * and scaffolder templates.
 *
 * @public
 */
export const createDebugXLogAction = () => {
  return createTemplateAction({
    id,
    description:
      'Writes a message into the log and/or lists all f iles in the workspace.',
    examples,
    schema: {
      input: {
        message: z =>
          z.string({ description: 'Message to output.' }).optional(),
        listWorkspace: z =>
          z
            .union([z.boolean(), z.enum(['with-filenames', 'with-contents'])], {
              description:
                'List all files in the workspace. If used with "with-contents", also the file contents are listed.',
            })
            .optional(),
      },
    },
    supportsDryRun: true,
    async handler(ctx) {

      ctx.logger.info(JSON.stringify(ctx.input, null, 2));

      ctx.logger.info(`This is the workspace path: ${ctx.workspacePath}`);
      ctx.logger.info(`listWorkspace: ${ctx.input?.listWorkspace ?? false}`);

      if (ctx.input?.message) {
        ctx.logger.info(ctx.input.message);
      }

      if (ctx.input?.listWorkspace) {
        const files = await recursiveReadDir(ctx.logger, ctx.workspacePath);
        ctx.logger.info(
          `Workspace:\n${files
            .map(f => {
              const relativePath = relative(ctx.workspacePath, f);
              if (ctx.input?.listWorkspace === 'with-contents') {
                const content = fs.readFileSync(f, 'utf-8');
                return ` - ${relativePath}:\n\n  ${content}`;
              }
              return `  - ${relativePath}`;
            })
            .join('\n')}`,
        );
      }
    },
  });
}

export async function recursiveReadDir(logger: LoggerService, dir: string): Promise<string[]> {
  logger.info(`Reading directory ${dir}`);
  const subdirs = await readdir(dir);
  logger.info(`Found subdirs ${subdirs.join(', ')}`);
  const files = await Promise.all(
    subdirs.map(async subdir => {
      const res = join(dir, subdir);
      return (await stat(res)).isDirectory() ? recursiveReadDir(logger, res) : [res];
    }),
  );
  logger.info(`Found files ${files.flat().join(', ')}`);
  return files.reduce((a, f) => a.concat(f), []);
}