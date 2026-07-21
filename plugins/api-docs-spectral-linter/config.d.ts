export interface Config {
  spectralLinter?: {
    /**
     * OpenAPI ruleset url
     * @visibility frontend
     */
    openApiRulesetUrl?: string;

    /**
     * AsyncAPI ruleset url
     * @visibility frontend
     */
    asyncApiRulesetUrl?: string;
  };
}
