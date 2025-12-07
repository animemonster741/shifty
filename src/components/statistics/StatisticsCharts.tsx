import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const teamData = [
  { name: 'Network Ops', count: 24 },
  { name: 'Security Ops', count: 18 },
  { name: 'Infrastructure', count: 15 },
  { name: 'Cloud Services', count: 12 },
  { name: 'App Support', count: 9 },
  { name: 'Database Ops', count: 6 },
];

const timeSeriesData = [
  { date: 'Mon', active: 12, created: 5 },
  { date: 'Tue', active: 15, created: 8 },
  { date: 'Wed', active: 18, created: 6 },
  { date: 'Thu', active: 22, created: 9 },
  { date: 'Fri', active: 20, created: 4 },
  { date: 'Sat', active: 16, created: 2 },
  { date: 'Sun', active: 14, created: 3 },
];

const statusData = [
  { name: 'Active', value: 45, color: 'hsl(142, 71%, 45%)' },
  { name: 'Expired', value: 128, color: 'hsl(222, 30%, 40%)' },
  { name: 'Pending', value: 3, color: 'hsl(38, 92%, 50%)' },
];

export function TeamBreakdownChart() {
  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Ignores by Team</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teamData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TimeSeriesChart() {
  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Active Ignores Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="active"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
                name="Active Ignores"
              />
              <Line
                type="monotone"
                dataKey="created"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--success))' }}
                name="Created"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusDistributionChart() {
  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
