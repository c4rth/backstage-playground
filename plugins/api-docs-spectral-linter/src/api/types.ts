import { createApiRef } from '@backstage/core-plugin-api';
import { ApiEntity } from '@backstage/catalog-model';

/**
 * The result of linting.
 *
 * @public
 */
export type LinterResultData = {
  /**
   * The line position in content.
   */
  linePosition: {
    start: number;
    end: number;
  };

  message: string;
  /**
   * The severity.
   */
  severity: number;

  ruleDocumentationUrl?: string;

  ruleDescription?: string;

  /**
   * The path in content.
   */
  path?: string[];
  /**
   * Rule set code
   */
  code?: string | number;

  /**
   * The formatted api definition
   */
  definition: string;
};

export type LinterResult = {
  /**
   * The ruleset url.
   */
  rulesetUrl: string;

  /**
   * The result data.
   */
  data: LinterResultData[];
};

export type LintOptions = {
  entity: ApiEntity;
};

/**
 * The API used by the spectral linter plugin to lint.
 *
 * @public
 */
export interface LinterApi {
  /** Lint. */
  lint(options: LintOptions): Promise<LinterResult>;

  /** Supported API types. */
  isApiTypeSupported(entity: ApiEntity): boolean;
}

/**
 * ApiRef for the LinterApi.
 *
 * @public
 */
export const linterApiRef = createApiRef<LinterApi>({
  id: 'plugin.spectral.linter.api',
});
