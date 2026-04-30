import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ResourceUtilizationProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  title: string;
}

export function ResourceUtilization({ data, title }: ResourceUtilizationProps) {
  return (
    <div className="glass-card rounded-xl border border-border p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(222 47% 10%)', 
                border: '1px solid hsl(222 47% 16%)',
                borderRadius: '8px',
                color: 'hsl(210 40% 98%)'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
