import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { AzureDevOpsApi } from './AzureDevOpsApi';

/** @public */
export class AzureDevOpsClient implements AzureDevOpsApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  public constructor(options: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  public async getRepositories(
    projectName: string,
    host?: string,
    org?: string,
  ): Promise<string[]> {
    const queryString = new URLSearchParams();
    if (host) {
      queryString.append('host', host);
    }
    if (org) {
      queryString.append('org', org);
    }
    let urlSegment = `projects/${projectName}/repositories`;
    if (queryString.toString()) {
      urlSegment += `?${queryString}`;
    }
    const repositories = await this.get<string[]>(urlSegment);
    return repositories;
  }

  public async getBranches(
    projectName: string,
    repoName: string,
    host?: string,
    org?: string,
  ): Promise<string[]> {
    const queryString = new URLSearchParams();
    if (host) {
      queryString.append('host', host);
    }
    if (org) {
      queryString.append('org', org);
    }
    let urlSegment = `projects/${projectName}/repositories/${repoName}/branches`;
    if (queryString.toString()) {
      urlSegment += `?${queryString}`;
    }
    const branches = await this.get<string[]>(urlSegment);
    return branches;
  }

  private async get<T>(path: string): Promise<T> {
    const baseUrl = `${await this.discoveryApi.getBaseUrl('azure-devops')}/`;
    const url = new URL(path, baseUrl);

    const response = await this.fetchApi.fetch(url.toString());

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json() as Promise<T>;
  }
}
