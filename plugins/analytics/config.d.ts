export interface Config {
  mcaComponents?: {
    /**
     * @visibility frontend
     */
    serviceBaseUrl?: string;
    /**
     * @visibility frontend
     */
    baseTypes?: {
      /**
       * @visibility frontend
       */
      baseUrl?: string;
    };
    /**
     * @visibility frontend
     */
  };
}
