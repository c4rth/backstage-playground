import { makeFieldSchema } from '@backstage/plugin-scaffolder-react';

/**
 * @public
 */
export const AzureDevOpsRepoPickerFieldSchema = makeFieldSchema({
  output: z =>
    z.object({
      project: z.string(),
      repository: z.string(),
      branch: z.string(),
    }),
  uiOptions: z =>
    z.object({
      allowedHost: z.string().optional().describe('Allowed SCM platform host'),
      allowedOrganization: z
        .string()
        .optional()
        .describe('Allowed organization in the given SCM platform'),
      requestUserCredentials: z
        .object({
          secretsKey: z
            .string()
            .describe(
              'Key used within the template secrets context to store the credential',
            ),
        })
        .optional()
        .describe(
          'If defined will request user credentials to auth against the given SCM platform',
        ),
    }),
});

export type AzureDevOpsRepoPickerProps =
  typeof AzureDevOpsRepoPickerFieldSchema.TProps;

export const AzureDevOpsRepoPickerSchema =
  AzureDevOpsRepoPickerFieldSchema.schema;
