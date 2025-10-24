import { Grid, Text } from '@backstage/ui';

export const ErrorComponent = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <Grid.Root>
      <Grid.Item>
        <Text color='danger'>{errorMessage}</Text>
      </Grid.Item>
    </Grid.Root>
  );
};