
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface ChartData {
  date: string;
  unresolved: number;
  inProgress: number;
  resolved: number;
  archived: number;
}

interface ReportChartProps {
  data: ChartData[];
}

export default function ReportChart({ data }: ReportChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available for chart
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="unresolved"
            stroke="#ef4444"
            strokeWidth={2}
            name="Unresolved"
          />
          <Line
            type="monotone"
            dataKey="inProgress"
            stroke="#f59e0b"
            strokeWidth={2}
            name="In Progress"
          />
          <Line
            type="monotone"
            dataKey="resolved"
            stroke="#10b981"
            strokeWidth={2}
            name="Resolved"
          />
          <Line
            type="monotone"
            dataKey="archived"
            stroke="#6b7280"
            strokeWidth={2}
            name="Archived"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
