import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type PainPoint = {
  id: string;
  theme?: string;
  response: string;
};

type ThemeChartProps = {
  painPoints: PainPoint[];
};

const THEME_COLORS = {
  Pricing: "#E63946",      // BuyFrame Red
  Sales: "#457B9D",        // Blue
  RevOps: "#1D3557",       // Navy
  Customer: "#2A9D8F",     // Teal
  Competitive: "#F77F00"   // Orange
};

export function ThemeChart({ painPoints }: ThemeChartProps) {
  // Count pain points by theme
  const themeCounts = painPoints.reduce((acc, point) => {
    if (point.theme) {
      acc[point.theme] = (acc[point.theme] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Convert to array for recharts
  const data = Object.entries(themeCounts).map(([theme, count]) => ({
    theme,
    count,
    color: THEME_COLORS[theme as keyof typeof THEME_COLORS] || "#666"
  }));

  // Sort by count descending
  data.sort((a, b) => b.count - a.count);

  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Theme Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pain points grouped by strategic themes
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="theme" 
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={{ stroke: '#ccc' }}
            />
            <YAxis 
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={{ stroke: '#ccc' }}
              label={{ value: 'Pain Points', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 justify-center">
          {data.map((item) => (
            <div key={item.theme} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium">{item.theme}</span>
              <span className="text-sm text-muted-foreground">({item.count})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
