import {
  BuildRun,
  BuildRunOptions,
  DashboardPullRequest,
  GitTag,
  PullRequest,
  PullRequestOptions,
  Readme,
  ReadmeConfig,
  Team,
} from '@backstage-community/plugin-azure-devops-common';

import { createApiRef } from '@backstage/core-plugin-api';

/** @public */
export const azureDevOpsApiRef = createApiRef<AzureDevOpsApi>({
  id: 'plugin.azure-devops.service',
});

/** @public */
export interface AzureDevOpsApi {
  getGitTags(
    projectName: string,
    repoName: string,
    entityRef: string,
    host?: string,
    org?: string,
  ): Promise<{ items: GitTag[] }>;

  getPullRequests(
    projectName: string,
    repoName: string,
    entityRef: string,
    host?: string,
    org?: string,
    options?: PullRequestOptions,
  ): Promise<{ items: PullRequest[] }>;

  getDashboardPullRequests(
    projectName: string,
    teamsLimit?: number,
    host?: string,
    org?: string,
  ): Promise<DashboardPullRequest[]>;

  getAllTeams(limit?: number, host?: string, org?: string): Promise<Team[]>;

  getUserTeamIds(
    userId: string,
    host?: string,
    org?: string,
  ): Promise<string[]>;

  getBuildRuns(
    projectName: string,
    entityRef: string,
    repoName?: string,
    definitionName?: string,
    host?: string,
    org?: string,
    options?: BuildRunOptions,
  ): Promise<{ items: BuildRun[] }>;

  getReadme(opts: ReadmeConfig): Promise<Readme>;

  getBuildRunLog(
    projectName: string,
    entityRef: string,
    buildId: number,
    host?: string,
    org?: string,
  ): Promise<{ log: string[] }>;

  getProjects(host?: string, org?: string): Promise<string[]>;
}
