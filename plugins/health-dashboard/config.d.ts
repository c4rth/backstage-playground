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
       * @visibility frontend
       */
      proxyEndpoints: string[];
    };
    /**
     * @visibility frontend
     */
    v2: {
      /**
       * @visibility frontend
       */
      proxyEndpoints: string[];
    };
  };
}
