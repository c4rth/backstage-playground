import { useEffect, useState } from 'react';
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
  // Due to a bug in the swagger-ui-react component, the component needs
  // to be created without content first.
  const [def, setDef] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDef(definition), 0);
    return () => clearTimeout(timer);
  }, [definition, setDef]);

  return (
    <div className={styles.wrapper}>
      <SwaggerUI
        spec={def}
        url=""
        deepLinking
        oauth2RedirectUrl={`${window.location.protocol}//${window.location.host}/oauth2-redirect.html`}
        {...swaggerUiProps}
      />
    </div>
  );
};
