import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTrades } from "../hooks/useTrades";
import {
  calculateMetrics, getEquityCurve, getStrategyBreakdown, getSessionBreakdown,
  getDayOfWeekBreakdown, getRMultipleDistribution, getEmotionPerformance,
  getDrawdownCurve, generateInsights
} from "../lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from "recharts";
import { Lightbulb, TrendingUp, TrendingDown } from "lucide-react";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function StatCard({ label, value, sub, positive }: { label: string; value: string | number; sub?: string; positive?: boolean }) {
  const color = positive === undefined ? "" : positive ? "text-green-400" : "text-red-400";
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="text-xs text-muted-foreground font-medium mb-1">{label}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const { t } = useTranslation();
  const { trades, loading } = useTrades();
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return trades.filter(t => {
      if (strategyFilter !== "all" && t.strategy !== strategyFilter) return false;
      if (sessionFilter !== "all" && t.sessionType !== sessionFilter) return false;
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      return true;
    });
  }, [trades, strategyFilter, sessionFilter, dateFrom, dateTo]);

  const metrics = useMemo(() => calculateMetrics(filtered), [filtered]);
  const equity = useMemo(() => getEquityCurve(filtered), [filtered]);
  const strategies = useMemo(() => getStrategyBreakdown(filtered), [filtered]);
  const sessions = useMemo(() => getSessionBreakdown(filtered), [filtered]);
  const dowData = useMemo(() => getDayOfWeekBreakdown(filtered), [filtered]);
  const rDist = useMemo(() => getRMultipleDistribution(filtered), [filtered]);
  const emotionData = useMemo(() => getEmotionPerformance(filtered), [filtered]);
  const drawdown = useMemo(() => getDrawdownCurve(filtered), [filtered]);
  const insights = useMemo(() => generateInsights(filtered), [filtered]);

  const winLoss = [
    { name: t('analytics.wins'), value: filtered.filter(t => t.outcome === 'win').length, fill: '#10b981' },
    { name: t('analytics.losses'), value: filtered.filter(t => t.outcome === 'loss').length, fill: '#ef4444' },
    { name: t('analytics.breakeven'), value: filtered.filter(t => t.outcome === 'breakeven').length, fill: '#6366f1' },
  ].filter(d => d.value > 0);

  const allStrategies = [...new Set(trades.map(t => t.strategy).filter(Boolean))];
  const hasFilters = strategyFilter !== 'all' || sessionFilter !== 'all' || dateFrom || dateTo;

  if (loading) return <div className="flex h-full items-center justify-center text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.analytics')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('analytics.basedOn', { count: filtered.filter(t => t.status === 'completed').length })}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-card border rounded-xl">
        <Select value={strategyFilter} onValueChange={setStrategyFilter}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('analytics.allStrategies')}</SelectItem>
            {allStrategies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sessionFilter} onValueChange={setSessionFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('analytics.allSessions')}</SelectItem>
            <SelectItem value="london">{t('analytics.sessionLondon')}</SelectItem>
            <SelectItem value="ny">{t('analytics.sessionNY')}</SelectItem>
            <SelectItem value="asian">{t('analytics.sessionAsian')}</SelectItem>
            <SelectItem value="overlap">{t('analytics.sessionOverlap')}</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="w-36 h-8 text-xs" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <Input type="date" className="w-36 h-8 text-xs" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        {hasFilters && (
          <button onClick={() => { setStrategyFilter('all'); setSessionFilter('all'); setDateFrom(''); setDateTo(''); }}
            className="text-xs text-primary hover:underline px-2">{t('analytics.clearFilters')}</button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t('analytics.netPnL')} value={`$${metrics.netPnL.toFixed(0)}`} positive={metrics.netPnL >= 0} />
        <StatCard label={t('analytics.winRate')} value={`${(metrics.winRate * 100).toFixed(1)}%`} positive={metrics.winRate >= 0.5} />
        <StatCard label={t('analytics.profitFactor')} value={metrics.profitFactor === 999 ? "∞" : metrics.profitFactor.toFixed(2)} positive={metrics.profitFactor >= 1.5} />
        <StatCard label={t('analytics.expectancy')} value={`$${metrics.expectancy.toFixed(0)}`} positive={metrics.expectancy > 0} />
        <StatCard label={t('analytics.avgR')} value={`${metrics.avgR.toFixed(2)}R`} positive={metrics.avgR > 0} />
        <StatCard label={t('analytics.maxDrawdown')} value={`${metrics.maxDrawdownPct.toFixed(1)}%`} positive={metrics.maxDrawdownPct < 10} />
        <StatCard label={t('analytics.sharpeRatio')} value={metrics.sharpeRatio.toFixed(2)} positive={metrics.sharpeRatio > 1} />
        <StatCard label={t('analytics.ruleCompliance')} value={`${metrics.avgRulesFollowed.toFixed(0)}%`} positive={metrics.avgRulesFollowed >= 70} />
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-primary">
              <Lightbulb className="w-4 h-4" /> {t('analytics.insights')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-bold mt-0.5">→</span>
                  <span>{ins}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equity Curve */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('analytics.equityCurve')}</CardTitle>
            <div className="flex items-center gap-2">
              {metrics.netPnL >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
              <span className={`text-sm font-bold ${metrics.netPnL >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                ${metrics.netPnL.toFixed(0)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {equity.length > 0 ? (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equity}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }}
                    formatter={(v: any) => [`$${Number(v).toFixed(0)}`, t('analytics.equityCurve')]} />
                  <Area type="monotone" dataKey="equity" stroke="hsl(var(--primary))" fill="url(#equityGrad)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">{t('analytics.noData')}</div>
          )}
        </CardContent>
      </Card>

      {/* 3-column charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Win/Loss Pie */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t('analytics.winLossSplit')}</CardTitle></CardHeader>
          <CardContent>
            {winLoss.length > 0 ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={winLoss} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {winLoss.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 -mt-2">
                  {winLoss.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">{t('analytics.noData')}</div>}
          </CardContent>
        </Card>

        {/* R Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t('analytics.rDistribution')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rDist} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }}
                    formatter={(v: any) => [v, t('analytics.trades')]} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {rDist.map((d, i) => <Cell key={i} fill={d.range.startsWith('-') || d.range.startsWith('<') ? '#ef4444' : '#10b981'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Session Performance */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t('analytics.sessionPnL')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessions} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="session" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }}
                    formatter={(v: any, n: string) => [n === 'pnl' ? `$${v}` : `${v}%`, n === 'pnl' ? t('analytics.netPnL') : t('analytics.winRate')]} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {sessions.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Breakdown */}
      {strategies.length > 0 && (
        <Card>
          <CardHeader><CardTitle>{t('analytics.strategyPerf')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strategies} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <YAxis type="category" dataKey="strategy" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={110} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }}
                    formatter={(v: any, n: string) => [n === 'pnl' ? `$${v}` : `${v}%`, n === 'pnl' ? t('analytics.netPnL') : t('analytics.winRate')]} />
                  <Bar dataKey="pnl" name="pnl" radius={[0, 4, 4, 0]}>
                    {strategies.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border">
                    <th className="text-left pb-2 font-medium">{t('analytics.stratTable.strategy')}</th>
                    <th className="text-right pb-2 font-medium">{t('analytics.stratTable.trades')}</th>
                    <th className="text-right pb-2 font-medium">{t('analytics.stratTable.winRate')}</th>
                    <th className="text-right pb-2 font-medium">{t('analytics.stratTable.pnl')}</th>
                  </tr>
                </thead>
                <tbody>
                  {strategies.map(s => (
                    <tr key={s.strategy} className="border-b border-border/50 last:border-0">
                      <td className="py-2 font-medium">{s.strategy}</td>
                      <td className="py-2 text-right text-muted-foreground">{s.count}</td>
                      <td className="py-2 text-right">
                        <span className={s.winRate >= 50 ? 'text-green-400' : 'text-destructive'}>{s.winRate}%</span>
                      </td>
                      <td className={`py-2 text-right font-semibold ${s.pnl >= 0 ? 'text-green-400' : 'text-destructive'}`}>
                        ${s.pnl.toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day of Week + Emotion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{t('analytics.dayOfWeek')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dowData.filter(d => d.count > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }}
                    formatter={(v: any) => [`$${v}`, t('analytics.netPnL')]} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {dowData.filter(d => d.count > 0).map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {emotionData.length > 0 && (
          <Card>
            <CardHeader><CardTitle>{t('analytics.emotionVsR')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emotionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}R`} />
                    <YAxis type="category" dataKey="emotion" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={75} />
                    <ReferenceLine x={0} stroke="hsl(var(--border))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }}
                      formatter={(v: any) => [`${v}R`, t('analytics.avgR')]} />
                    <Bar dataKey="avgR" radius={[0, 4, 4, 0]}>
                      {emotionData.map((d, i) => <Cell key={i} fill={d.avgR >= 0 ? '#10b981' : '#ef4444'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Drawdown Curve */}
      {drawdown.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('analytics.drawdownCurve')}</CardTitle>
              <Badge variant="destructive" className="text-xs">{metrics.maxDrawdownPct.toFixed(1)}% {t('analytics.maxDD')}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={drawdown}>
                  <defs>
                    <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }}
                    formatter={(v: any) => [`${v}%`, t('analytics.maxDrawdown')]} />
                  <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="url(#ddGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
