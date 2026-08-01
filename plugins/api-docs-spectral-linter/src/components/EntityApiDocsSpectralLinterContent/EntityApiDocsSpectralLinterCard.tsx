import {
  CodeSnippet,
  MarkdownContent,
  WarningPanel,
} from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import { ApiEntity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { linterApiRef } from '../../api';
import { EntityInfoCard, useEntity } from '@backstage/plugin-catalog-react';
import { Grid, Text, Link } from '@backstage/ui';
import { Progress } from '@internal/plugin-api-platform-react';

/**
 * Component for browsing API docs spectral linter on an entity page.
 * @public
 */
export const EntityApiDocsSpectralLinterCard = () => {
  const { entity } = useEntity<ApiEntity>();
  const linterApi = useApi(linterApiRef);

  const { value, loading, error } = useAsync(async () => {
    return linterApi.lint({ entity: entity as ApiEntity });
  }, [entity]);

  const getSeverity = (severity: number) => {
    switch (severity) {
      case 0:
        return 'error';
      case 1:
        return 'warning';
      default:
        return 'info';
    }
  };

  const previewContent = (
    text: string,
    startLine: number,
    endLine: number,
    path: string,
    isPrettyPrinted: boolean,
  ) => {
    const textArray = text.split('\n');
    textArray.splice(0, startLine);
    textArray.splice(
      endLine === 0 ? endLine + 1 : endLine,
      textArray.length - 1,
    );
    textArray.unshift(`... line ${startLine + 1} in source under path ${path}`);
    textArray.push(`... line ${endLine + 1} in source`);

    if (isPrettyPrinted) {
      textArray.unshift(
        '# Notice: The API definition has been pretty printed for readability.\n# The line numbers will not match the actual definition.',
      );
    }
    return textArray.join('\n');
  };

  return (
    <EntityInfoCard
      title="Spectral Linter"
      headerActions={
        value?.rulesetUrl && (
          <Link href={value?.rulesetUrl} target="_blank">
            Rule set used
          </Link>
        )
      }
    >
      {loading && <Progress />}

      {!loading && error && (
        <WarningPanel title="Failed to lint API" message={error?.message} />
      )}

      {!loading &&
        !error &&
        (value?.data?.length ? (
          value.data.map((ruleResult, idx) => (
            <Grid.Root key={idx} columns="12">
              <Grid.Item colSpan="12" style={{ marginBottom: '12px' }}>
                <WarningPanel
                  title={`${ruleResult.message} (${ruleResult.code})`}
                  severity={getSeverity(ruleResult.severity)}
                  message={
                    <EntityInfoCard
                      headerActions={
                        ruleResult.ruleDocumentationUrl ? (
                          <Link
                            href={ruleResult.ruleDocumentationUrl}
                            target="_blank"
                          >
                            View rule documentation
                          </Link>
                        ) : undefined
                      }
                    >
                      <MarkdownContent
                        content={ruleResult.ruleDescription || ''}
                      />
                      <CodeSnippet
                        text={previewContent(
                          ruleResult.definition,
                          ruleResult.linePosition.start,
                          ruleResult.linePosition.end,
                          ruleResult.path?.join(' / ') || 'unknown',
                          entity.spec.definition !== ruleResult.definition,
                        )}
                        language="yaml"
                        customStyle={{
                          background: 'transparent',
                          margin: '0',
                          padding: '0.5em 0',
                        }}
                      />
                    </EntityInfoCard>
                  }
                />
              </Grid.Item>
            </Grid.Root>
          ))
        ) : (
          <Text>No linting errors found...</Text>
        ))}
    </EntityInfoCard>
  );
};
