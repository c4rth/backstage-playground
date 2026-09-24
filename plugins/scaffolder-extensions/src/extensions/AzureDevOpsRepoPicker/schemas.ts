import { makeFieldSchema } from '@backstage/plugin-scaffolder-react';

/**
 * @public
 */
export const AzureDevOpsRepoPickerFieldSchema = makeFieldSchema({
  output: z => z.string(),
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

/**
 * The input props that can be specified under `ui:options` for the
 * `AzureDevOpsRepoPicker` field extension.
 *
 * @public
 * @deprecated this will be removed as it's no longer used
 */
export type AzureDevOpsRepoPickerUiOptions = NonNullable<
  (typeof AzureDevOpsRepoPickerFieldSchema.TProps.uiSchema)['ui:options']
>;

export type AzureDevOpsRepoPickerProps =
  typeof AzureDevOpsRepoPickerFieldSchema.TProps;

// This has been duplicated to /plugins/scaffolder/src/components/fields/RepoBranchPicker/schema.ts
// NOTE: There is a bug with this failing validation in the custom field explorer due
// to https://github.com/rjsf-team/react-jsonschema-form/issues/675 even if
// requestUserCredentials is not defined
export const AzureDevOpsRepoPickerSchema =
  AzureDevOpsRepoPickerFieldSchema.schema;
