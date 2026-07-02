import { Suspense, lazy } from 'react';
import type { McaComponentSnippetProps } from './McaComponentSnippetContent';

export type { McaComponentSnippetProps } from './McaComponentSnippetContent';

const LazyMcaComponentSnippetContent = lazy(() =>
  import('./McaComponentSnippetContent').then(m => ({
    default: m.McaComponentSnippet,
  })),
);

/**
 * Thin wrapper on top of {@link https://react-syntax-highlighter.github.io/react-syntax-highlighter/ | react-syntax-highlighter}
 * providing consistent theming and copy code button
 *
 * @public
 */
export function McaComponentSnippet(props: McaComponentSnippetProps) {
  return (
    <Suspense fallback={<div />}>
      <LazyMcaComponentSnippetContent {...props} />
    </Suspense>
  );
}
