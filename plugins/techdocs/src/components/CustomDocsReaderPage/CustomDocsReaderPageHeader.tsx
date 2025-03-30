import { Entity } from "@backstage/catalog-model";
import { PropsWithChildren } from "react";
import {
    EntityRefLink, EntityRefLinks,
    getEntityRelations,
} from '@backstage/plugin-catalog-react';
import {
    RELATION_OWNED_BY,
} from '@backstage/catalog-model';
import { Header, HeaderLabel } from "@backstage/core-components";
import React from "react";

export type CustomDocsReaderPageHeaderProps = PropsWithChildren<{
    entity?: Entity;
}>;

export const CustomDocsReaderPageHeader = (props: CustomDocsReaderPageHeaderProps) => {
    const { entity } = props;
    const entityMetadata = entity?.metadata;
    const spec = entity?.spec;
    const lifecycle = spec?.lifecycle;
    const ownedByRelations = entityMetadata
        ? getEntityRelations(entity, RELATION_OWNED_BY)
        : [];


    const labels = (
        <>
            <HeaderLabel
                label={entityMetadata?.kind?.toString() || 'entity'}
                value={
                    <EntityRefLink
                        color="inherit"
                        entityRef={entity!}
                        title={entityMetadata?.description || entityMetadata?.name}
                        defaultKind="Component"
                    />
                }
            />
            {ownedByRelations.length > 0 && (
                <HeaderLabel
                    label="Owner"
                    value={
                        <EntityRefLinks
                            color="inherit"
                            entityRefs={ownedByRelations}
                            defaultKind="group"
                        />
                    }
                />
            )}
            {lifecycle ? (
                <HeaderLabel label="Lifecycle" value={String(lifecycle)} />
            ) : null}
        </>
    );

    return (
        <Header
            type="Documentation"
            typeLink='/external-docs'
            title={entity?.metadata.description || entity?.metadata.name}>
            {labels}
            {props.children}
        </Header>
    );

}