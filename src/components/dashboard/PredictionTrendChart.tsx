import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { format } from "date-fns";

interface Prediction {
  id: string;
  probability: number;
  created_at: string;
}

interface PredictionTrendChartProps {
  predictions: Prediction[];
}

export function PredictionTrendChart({ predictions }: PredictionTrendChartProps) {
  const data = predictions
    .slice()
    .reverse()
    .map((p) => ({
      date: format(new Date(p.created_at), "MMM d"),
      probability: Number(p.probability),
    }));

  if (data.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Prediction Trend</CardTitle>
          <CardDescription>Track your placement probability over time</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[280px] text-muted-foreground">
          <p className="text-center">
            Make at least 2 predictions to see your trend chart
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-display">Prediction Trend</CardTitle>
        <CardDescription>Track your placement probability over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProbability" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              stroke="hsl(var(--border))"
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              stroke="hsl(var(--border))"
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [`${value}%`, "Probability"]}
            />
            <Area
              type="monotone"
              dataKey="probability"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProbability)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
