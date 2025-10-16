export interface Config {
  azureDevOps?: {
    /**
     * The hostname of the given Azure instance
    * @visibility frontend
     */
    host: string;
    /**
     * The organization of the given Azure instance
    * @visibility frontend
     */
    organization: string;
  },
  apiPlatform?: {
    /**
     * The organization of the given Azure instance
    * @visibility frontend
     */
    organization: string;
    /**
     * The feed name of the given Azure instance
    * @visibility frontend
     */
    feedName: string;
    /**
     * The DNS name of the API Platform instance
    * @visibility frontend
     */
    dns: string;
    /**
     * The group prefix for APIs in the API Platform instance
    * @visibility frontend
     */
    groupPrefix: string;
  }
}