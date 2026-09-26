import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import styles from './OpenApiDefinition.module.css';

export type OpenApiDefinitionProps = {
  definition: string;
} & Omit<React.ComponentProps<typeof SwaggerUI>, 'spec'>;

export const OpenApiDefinition = ({
  definition,
  ...swaggerUiProps
}: OpenApiDefinitionProps) => {

  return (
    <div className={styles.wrapper}>
      <SwaggerUI 
        spec={definition}
        deepLinking
        displayOperationId={true}
        oauth2RedirectUrl={`${window.location.protocol}//${window.location.host}/oauth2-redirect.html`}
        docExpansion="list"
        {...swaggerUiProps}
      />
    </div>
  );
};
