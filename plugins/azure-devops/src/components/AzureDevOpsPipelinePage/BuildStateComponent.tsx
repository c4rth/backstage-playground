import {
  StatusAborted,
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
  StatusWarning,
} from '@backstage/core-components';
import { BuildResult, BuildStatus } from '@backstage-community/plugin-azure-devops-common';
import { Flex } from '@backstage/ui';

const BUILD_RESULT_CONFIG = {
  [BuildResult.Succeeded]: { icon: StatusOK, label: 'Succeeded' },
  [BuildResult.PartiallySucceeded]: { icon: StatusWarning, label: 'Partially Succeeded' },
  [BuildResult.Failed]: { icon: StatusError, label: 'Failed' },
  [BuildResult.Canceled]: { icon: StatusAborted, label: 'Canceled' },
  [BuildResult.None]: { icon: StatusWarning, label: 'Unknown' },
} as const;

const BUILD_STATUS_CONFIG = {
  [BuildStatus.InProgress]: { icon: StatusRunning, label: 'In Progress' },
  [BuildStatus.Cancelling]: { icon: StatusAborted, label: 'Cancelling' },
  [BuildStatus.Postponed]: { icon: StatusPending, label: 'Postponed' },
  [BuildStatus.NotStarted]: { icon: StatusAborted, label: 'Not Started' },
  [BuildStatus.None]: { icon: StatusWarning, label: 'Unknown' },
} as const;

const StatusDisplay = ({ icon: Icon, label }: { icon: React.ComponentType; label: string }) => (
  <Flex gap='0' align='baseline'>
    <Icon /> {label}
  </Flex>
);

const BuildResultComponent = ({ result }: { result: number | undefined }) => {
  const config = result !== undefined
    ? BUILD_RESULT_CONFIG[result as BuildResult]
    : BUILD_RESULT_CONFIG[BuildResult.None];

  return <StatusDisplay icon={config.icon} label={config.label} />;
};

export const BuildStateComponent = ({
  status,
  result,
}: {
  status: number | undefined;
  result: number | undefined;
}) => {
  if (status === BuildStatus.Completed) {
    return <BuildResultComponent result={result} />;
  }
  const statusKey = status !== undefined ? status : BuildStatus.None;
  const config = BUILD_STATUS_CONFIG[statusKey as keyof typeof BUILD_STATUS_CONFIG]
    ?? BUILD_STATUS_CONFIG[BuildStatus.None];

  return <StatusDisplay icon={config.icon} label={config.label} />;
};