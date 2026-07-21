import { Entity } from '@backstage/catalog-model';

/**
 * Spectral linter plugin annotation.
 * @public
 */
export const ANNOTATION_SPECTRAL_RULESET_URL =
  'backstage.io/spectral-ruleset-url';

/**
 * Utility function to get the value of an entity Spectral linter annotation.
 * @public
 */
export const getSpectralRulesetUrl = (entity: Entity) =>
  entity.metadata.annotations?.[ANNOTATION_SPECTRAL_RULESET_URL]?.trim();

/**
 * Utility function to determine if the given entity can be linted.
 * @public
 */
export const isApiDocsSpectralLinterAvailable = (entity: Entity) =>
  Boolean(entity.kind === 'API') &&
  Boolean(entity.spec?.type === 'openapi' || entity.spec?.type === 'asyncapi');
