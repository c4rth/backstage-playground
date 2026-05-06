import { DailyVisitor } from '../../api/CustomAnalyticsApi';
import { Card, CardBody, CardHeader, Text } from '@backstage/ui';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  TooltipProps,
} from 'recharts';

interface PayloadItem {
  name: string;
  value: number;
  color: string;
  payload: any;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const total = payload.reduce(
      (sum, entry) => sum + (Number(entry.value) || 0),
      0,
    );

    return (
      <div
        style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      >
        <p
          style={{
            fontWeight: 'bold',
            margin: '0 0 5px',
            textAlign: 'center',
            marginBottom: '4px',
          }}
        >
          <i>{label}</i>
        </p>
        {payload.map((entry, index) => (
          <div key={index} style={{ color: entry.color, fontSize: '14px' }}>
            • {entry.name}: {entry.value}
          </div>
        ))}
        <p
          style={{
            fontWeight: 'bold',
            margin: 0,
            textAlign: 'center',
            marginTop: '4px',
          }}
        >
          Total: {total}
        </p>
      </div>
    );
  }

  return null;
};

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [_year, month, day] = dateStr.split('-');
  return `${day}/${month}`;
};

export const DailyUsersChart = ({ data }: { data: DailyVisitor[] }) => {
  return (
    <Card style={{ marginBottom: '16px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader>
        <Text variant="title-x-small">Daily unique users</Text>
      </CardHeader>
      <CardBody style={{ flexGrow: 1, minHeight: 0 }}>
        {data.length === 0 ? (
          <p>No daily unique user data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatDisplayDate} />
                <YAxis
                  allowDecimals={false}
                  domain={[0, dataMax => Math.max(2, Math.ceil(dataMax))]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="visitors"
                  stackId="a"
                  fill="var(--bui-bg-solid)"
                />
                <Bar
                  dataKey="guests"
                  stackId="a"
                  fill="color-mix(in srgb, var(--bui-bg-solid) 50%, transparent)"
                />
              </BarChart>
            </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
};
