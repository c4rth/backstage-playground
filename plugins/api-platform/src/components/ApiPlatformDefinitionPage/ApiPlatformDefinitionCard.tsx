import {
    CardTab,
    TabbedCard,
} from '@backstage/core-components';
import { ApiEntity } from "@backstage/catalog-model"
import React from 'react';
import { OpenApiDefinitionWidget, PlainApiDefinitionWidget } from '@backstage/plugin-api-docs';

export const ApiPlatformDefinitionCard = (props: { apiEntity: ApiEntity }) => {

    const { apiEntity } = props;
    return (
        <TabbedCard title={apiEntity.metadata.name} >
            <CardTab label='OpenApi' key="widget">
                <OpenApiDefinitionWidget definition={apiEntity.spec.definition.toString()} />
            </CardTab>
            <CardTab label="Raw" key="raw">
                <PlainApiDefinitionWidget
                    definition={apiEntity.spec.definition}
                    language={apiEntity.spec.type}
                />
            </CardTab>
        </TabbedCard >
    );
}