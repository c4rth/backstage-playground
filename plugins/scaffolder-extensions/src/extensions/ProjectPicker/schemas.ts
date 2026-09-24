import { makeFieldSchema } from '@backstage/plugin-scaffolder-react';

/**
 * @public
 */
export const ProjectPickerFieldSchema = makeFieldSchema({
  output: z => z.string(),
  uiOptions: z =>
    z.object({
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
 * `RepoUrlPicker` field extension.
 *
 * @public
 * @deprecated this will be removed as it's no longer used
 */
export type ProjectPickerUiOptions = NonNullable<
  (typeof ProjectPickerFieldSchema.TProps.uiSchema)['ui:options']
>;

export type ProjectPickerProps = typeof ProjectPickerFieldSchema.TProps;

// This has been duplicated to /plugins/scaffolder/src/components/fields/RepoBranchPicker/schema.ts
// NOTE: There is a bug with this failing validation in the custom field explorer due
// to https://github.com/rjsf-team/react-jsonschema-form/issues/675 even if
// requestUserCredentials is not defined
export const ProjectPickerSchema = ProjectPickerFieldSchema.schema;
