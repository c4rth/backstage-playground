function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'GREEN':
      return '#4caf50';
    case 'RED':
      return '#f44336';
    default:
      return '#9e9e9e';
  }
}

export const HealthStatusIndicator = ({ status }: { status: string }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-block',
      borderRadius: '50%',
      width: '1em',
      height: '1em',
      flexShrink: 0,
      backgroundColor: getStatusColor(status),
    }}
  />
);
