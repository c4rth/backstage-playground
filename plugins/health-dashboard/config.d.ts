export interface Config {
  /**
   * @visibility frontend
   */
  healthProbes: {
    /**
     * @visibility frontend
     */
    v1: {
      /**
       * Whether the v1 dashboard is enabled. Defaults to true.
       * @visibility frontend
       */
      enabled?: boolean;
      /**
       * @visibility frontend
       */
      proxyEndpoints: string[];
    };
    /**
     * @visibility frontend
     */
    v2: {
      /**
       * Whether the v2 dashboard is enabled. Defaults to true.
       * @visibility frontend
       */
      enabled?: boolean;
      /**
       * @visibility frontend
       */
      proxyEndpoints: string[];
    };
  };
}
