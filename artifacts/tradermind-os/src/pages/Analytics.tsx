import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { useTrades } from "../hooks/useTrades";
import { calculateMetrics } from "../lib/analytics";

export default function Analytics() {
  const { t } = useTranslation();
  const { trades, loading } = useTrades();

  if (loading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">{t('common.loading')}</div>;
  }

  const completedTrades = trades.filter(t => t.status === 'completed' && t.pnl !== undefined);
  const sortedTrades = [...completedTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let runningEquity = 0;
  const equityData = sortedTrades.map((trade, index) => {
    runningEquity += (trade.pnl || 0);
    return {
      name: `Trade ${index + 1}`,
      equity: runningEquity,
      date: new Date(trade.date).toLocaleDateString()
    };
  });

  const sessionPerformance = completedTrades.reduce((acc, trade) => {
    if (!acc[trade.sessionType]) {
      acc[trade.sessionType] = { pnl: 0, count: 0 };
    }
    acc[trade.sessionType].pnl += (trade.pnl || 0);
    acc[trade.sessionType].count += 1;
    return acc;
  }, {} as Record<string, { pnl: number, count: number }>);

  const sessionData = Object.entries(sessionPerformance).map(([session, data]) => ({
    session,
    pnl: data.pnl,
    count: data.count
  }));

  const metrics = calculateMetrics(trades);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.analytics')}</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Profit Factor</div>
            <div className="text-2xl font-bold">{metrics.profitFactor.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Expectancy</div>
            <div className="text-2xl font-bold">${metrics.expectancy.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Max Drawdown</div>
            <div className="text-2xl font-bold text-destructive">-${metrics.maxDrawdown.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Avg Win / Avg Loss</div>
            <div className="text-2xl font-bold text-muted-foreground">
              <span className="text-success">${metrics.avgWin.toFixed(0)}</span> / <span className="text-destructive">${metrics.avgLoss.toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="equity" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance by Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="session" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {sessionData.map((entry, index) => (
                      <cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}