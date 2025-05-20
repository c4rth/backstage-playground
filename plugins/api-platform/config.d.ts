export interface Config {
  apiPlatform?: {
    /**
    * @visibility frontend
    */
    organization?: string;
    /**
    * @visibility frontend
    */
    feedName?: string;
    /**
    * @visibility frontend
    */
    groupPrefix?: string;
    /**
    * @visibility frontend
    */
    dns?: string;
  };
}