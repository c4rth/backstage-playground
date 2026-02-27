import { Text, Flex, DialogTrigger, Dialog, DialogHeader, DialogBody, Box, } from '@backstage/ui';
import {
  Progress,
} from '@backstage/core-components';

export const LogsDialog = ({ isOpen, onOpenChange, title: dialogTitle, loading, logs }: {
  isOpen: boolean;
  title: string;
  loading: boolean;
  logs: string[] | null;
  onOpenChange: (isOpen: boolean) => void;
}) => (
  <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
    <Dialog width='100%' height='100%'>
      <DialogHeader>
        <Flex style={{ width: '100%' }}>
          Logs - {dialogTitle}
        </Flex>
      </DialogHeader>
      <DialogBody>
        {loading ? (
          <Progress />
        ) : (
          <Box as='pre' style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
            <Text style={{ fontFamily: 'monospace' }}>
              {logs?.join('\n') ?? 'No logs available'}
            </Text>
          </Box>
        )}
      </DialogBody>
    </Dialog>
  </DialogTrigger>
);