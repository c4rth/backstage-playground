import { Progress } from '@backstage/core-components';
import { lazy, Suspense } from 'react';

// The swagger-ui component and related CSS has a significant size, only load it
// if the element is actually used.
const LazyOpenApiDefinition = lazy(() =>
  import('./OpenApiDefinition').then(m => ({
    default: m.OpenApiDefinition,
  })),
);

/** @public */
export type OpenApiDefinitionWidgetProps = {
  definition: string;
  requestInterceptor?: (req: any) => any | Promise<any>;
  supportedSubmitMethods?: string[];
};

/** @public */
export const OpenApiDefinitionWidget = (
  props: OpenApiDefinitionWidgetProps,
) => {
  const validSubmitMethods =
    (props.supportedSubmitMethods?.map(method =>
      method.toLocaleLowerCase(),
    ) as Array<
      'head' | 'delete' | 'options' | 'get' | 'put' | 'post' | 'patch' | 'trace'
    >) || undefined;
  return (
    <Suspense fallback={<Progress />}>
      <LazyOpenApiDefinition
        {...props}
        supportedSubmitMethods={validSubmitMethods as any}
        showExtensions
        showCommonExtensions
      />
    </Suspense>
  );
};
