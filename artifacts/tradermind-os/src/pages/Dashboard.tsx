import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTrades } from "../hooks/useTrades";
import { useProfile } from "../hooks/useProfile";
import { calculateMetrics, getEquityCurve } from "../lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Link } from "wouter";
import { TradeWizard } from "../components/TradeWizard";
import { 
  TrendingUp, 
  Target, 
  Activity, 
  Wallet, 
  PlusCircle,
  History,
  Brain,
  Shield
} from "lucide-react";
import { useGrowthCycles } from "../hooks/useGrowthCycles";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { t } = useTranslation();
  const { trades, loading: tradesLoading } = useTrades();
  const { profile, loading: profileLoading } = useProfile();
  const { cycles } = useGrowthCycles();
  const [wizardOpen, setWizardOpen] = useState(false);

  if (tradesLoading || profileLoading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">{t('common.loading')}</div>;
  }

  const metrics = calculateMetrics(trades);
  const equityCurve = getEquityCurve(trades).slice(-20);
  const activeCycle = cycles.find(c => c.status === 'active');
  const recentTrades = trades.slice(0, 6);

  const kpis = [
    { label: t('dashboard.netProfit'), value: `${metrics.netPnL.toFixed(0)}`, icon: Wallet, positive: metrics.netPnL >= 0 },
    { label: t('dashboard.winRate'), value: `${(metrics.winRate * 100).toFixed(1)}%`, icon: Target, positive: metrics.winRate >= 0.5 },
    { label: t('dashboard.avgR'), value: `${metrics.avgR.toFixed(2)}R`, icon: TrendingUp, positive: metrics.avgR > 0 },
    { label: 'Profit Factor', value: metrics.profitFactor === 999 ? '∞' : metrics.profitFactor.toFixed(2), icon: Activity, positive: metrics.profitFactor >= 1.5 },
    { label: t('dashboard.totalTrades'), value: metrics.totalTrades, icon: History, positive: undefined },
    { label: 'Max Drawdown', value: `${metrics.maxDrawdownPct.toFixed(1)}%`, icon: Shield, positive: metrics.maxDrawdownPct < 10 },
    { label: 'Expectancy', value: `${metrics.expectancy.toFixed(0)}`, icon: Brain, positive: metrics.expectancy > 0 },
    { label: 'Rules Followed', value: `${metrics.avgRulesFollowed.toFixed(0)}%`, icon: Shield, positive: metrics.avgRulesFollowed >= 70 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.welcome')}, {profile?.name || 'Trader'} 👋</h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setWizardOpen(true)} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            {t('dashboard.newTrade')}
          </Button>
          <Link href="/psychology">
            <Button variant="outline" className="gap-2">
              <Brain className="w-4 h-4" />
              Log Session
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, positive }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className={cn("text-2xl font-bold",
                positive === undefined ? "" : positive ? "text-green-400" : "text-destructive")}>
                {value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Mini Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Equity Curve</span>
              <Badge variant={metrics.netPnL >= 0 ? "default" : "destructive"} className={metrics.netPnL >= 0 ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
                {metrics.netPnL >= 0 ? '+' : ''}${metrics.netPnL.toFixed(0)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {equityCurve.length > 1 ? (
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityCurve}>
                    <defs>
                      <linearGradient id="dashEqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 11 }}
                      formatter={(v: any) => [`${Number(v).toFixed(0)}`, 'Equity']} />
                    <Area type="monotone" dataKey="equity" stroke="hsl(var(--primary))" fill="url(#dashEqGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">
                Record trades to see your equity curve
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Cycle */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {t('dashboard.activeCycle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeCycle ? (
              <div className="space-y-3">
                <div>
                  <div className="font-semibold">{activeCycle.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Since {new Date(activeCycle.startDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 rounded-lg bg-background/50">
                    <div className="text-lg font-bold text-primary">{activeCycle.targetWinRate || '—'}%</div>
                    <div className="text-xs text-muted-foreground">Target WR</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-background/50">
                    <div className="text-lg font-bold text-primary">1:{activeCycle.targetRR || '—'}</div>
                    <div className="text-xs text-muted-foreground">Target RR</div>
                  </div>
                </div>
                {activeCycle.goals.slice(0, 2).map((g, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-primary mt-0.5">→</span>{g}
                  </div>
                ))}
                <Link href="/growth">
                  <Button variant="outline" size="sm" className="w-full text-xs">View Missions</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                <p className="text-sm text-muted-foreground">No active cycle</p>
                <Link href="/growth">
                  <Button variant="default" size="sm" className="gap-1.5">
                    <PlusCircle className="w-3.5 h-3.5" /> Start Cycle
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2"><History className="w-4 h-4" /> {t('dashboard.recentTrades')}</span>
            <Link href="/journal">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">View all →</Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentTrades.length > 0 ? (
            <div className="divide-y divide-border">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between px-6 py-3 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-1.5 h-10 rounded-full", trade.outcome === 'win' ? 'bg-green-500' : trade.outcome === 'loss' ? 'bg-destructive' : 'bg-muted')} />
                    <div>
                      <div className="font-mono font-semibold text-sm">{trade.symbol}
                        <span className={cn("ml-1.5 text-xs", trade.direction === 'long' ? 'text-green-400' : 'text-red-400')}>
                          {trade.direction === 'long' ? '▲' : '▼'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(trade.date).toLocaleDateString()} · {trade.strategy} · {trade.sessionType}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    {trade.tradeQualityScore !== undefined && (
                      <div className="hidden sm:block">
                        <div className={cn("text-xs font-medium px-2 py-0.5 rounded",
                          trade.tradeQualityScore >= 70 ? 'bg-green-500/10 text-green-400' :
                          trade.tradeQualityScore >= 50 ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-destructive/10 text-destructive')}>
                          Q:{trade.tradeQualityScore}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className={cn("font-bold text-sm", trade.outcome === 'win' ? 'text-green-400' : trade.outcome === 'loss' ? 'text-destructive' : '')}>
                        {trade.pnl != null ? `${trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(0)}` : '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {trade.pnlR != null ? `${trade.pnlR > 0 ? '+' : ''}${trade.pnlR}R` : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No trades yet — click "New Trade" to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      <TradeWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}