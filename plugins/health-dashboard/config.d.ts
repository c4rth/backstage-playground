export interface Config {
  /**
   * @visibility frontend
   */
  healthProbes: {
    /**
     * @visibility frontend
     */
    proxyEndpoints: string[];
  };
}
