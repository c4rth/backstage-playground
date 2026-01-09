/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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