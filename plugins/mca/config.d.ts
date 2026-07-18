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
    urlLocations?: [
      {
        /**
         * @visibility frontend
         */
        oldDns?: string;
        /**
         * @visibility frontend
         */
        newDns?: string;
      },
    ];
  };
}
