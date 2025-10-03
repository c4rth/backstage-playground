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
  };
}