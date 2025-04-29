export interface Config {
  mcaComponents?: {
    /**
    * The 'baseUrl' attribute
    * @visibility frontend
    */
    serviceBaseUrl?: string;
    /**
    * The 'defaultPackage' attribute
    * @visibility frontend
    */
    defaultPackage?: string;
    /**
     * The 'baseTypesUrl' attribute
     * @visibility frontend
     */
    baseTypesUrl?: string;
  };
}