export interface Config {
  /**
   * Configuration options for the azure-devops-backend plugin
   * @visibility frontend
   */
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
    /**
     * Pull Request Dashboard config
     * @visibility frontend
     */
    pullRequestDashboard: {
      /**
       * List of organizations to be used in the
       * Pull Request Dashboard's Organization dropdown
       * Each organization should specify both organization name and host
       * @visibility frontend
       */
      organizations: Array<{
        /**
         * Azure DevOps organization name
         * @visibility frontend
         */
        organization: string;
        /**
         * Azure DevOps host URL
         * @visibility frontend
         */
        host: string;
      }>;
    };
  };
}
