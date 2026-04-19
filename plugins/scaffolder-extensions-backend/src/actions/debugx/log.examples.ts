import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';

export const examples: TemplateExample[] = [
  {
    description: 'Write a debug message',
    example: yaml.stringify({
      steps: [
        {
          action: 'debug:log',
          id: 'write-debug-line',
          name: 'Write "Hello Backstage!" log line',
          input: {
            message: 'Hello Backstage!',
          },
        },
      ],
    }),
  },
  {
    description: 'List the workspace directory',
    example: yaml.stringify({
      steps: [
        {
          action: 'debug:log',
          id: 'write-workspace-directory',
          name: 'List the workspace directory',
          input: {
            listWorkspace: true,
          },
        },
      ],
    }),
  },
  {
    description: 'List the workspace directory with file contents',
    example: yaml.stringify({
      steps: [
        {
          action: 'debug:log',
          id: 'write-workspace-directory',
          name: 'List the workspace directory with file contents',
          input: {
            listWorkspace: 'with-contents',
          },
        },
      ],
    }),
  },
];
