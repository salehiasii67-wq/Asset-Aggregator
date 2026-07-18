import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTrades } from "../hooks/useTrades";
import { useGrowthCycles } from "../hooks/useGrowthCycles";
import { usePsychology } from "../hooks/usePsychology";
import { calculateMetrics, getStrategyBreakdown, getSessionBreakdown, getEmotionPerformance } from "../lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from "recharts";
import { Star, TrendingUp, Target, Brain, Shield, Zap, Award, AlertTriangle } from "lucide-react";

function dnaScore(val: number, max = 10): number {
  return Math.round((val / max) * 100);
}

export default function Evolution() {
  const { t } = useTranslation();
  const { trades, loading } = useTrades();
  const { cycles } = useGrowthCycles();
  const { logs } = usePsychology();

  const completed = trades.filter(t => t.status === "completed" && t.pnl !== undefined);
  const metrics = useMemo(() => calculateMetrics(trades), [trades]);
  const strategies = useMemo(() => getStrategyBreakdown(trades), [trades]);
  const sessions = useMemo(() => getSessionBreakdown(trades), [trades]);
  const emotions = useMemo(() => getEmotionPerformance(trades), [trades]);

  // Best session
  const bestSession = [...sessions].sort((a, b) => b.pnl - a.pnl)[0];
  const worstSession = [...sessions].sort((a, b) => a.pnl - b.pnl)[0];

  // Best strategy
  const bestStrategy = strategies[0];
  const worstStrategy = [...strategies].sort((a, b) => a.pnl - b.pnl)[0];

  // Best emotion state
  const bestEmotion = emotions[0];

  // Process quality: good process = rules followed (separate from outcome)
  const goodProcessGoodResult = completed.filter(t => t.rulesFollowed && t.outcome === 'win').length;
  const goodProcessBadResult = completed.filter(t => t.rulesFollowed && t.outcome === 'loss').length;
  const badProcessGoodResult = completed.filter(t => !t.rulesFollowed && t.outcome === 'win').length;
  const badProcessBadResult = completed.filter(t => !t.rulesFollowed && t.outcome === 'loss').length;

  // A+ trades: quality score > 80
  const aPlusTrades = completed.filter(t => (t.tradeQualityScore || 0) >= 80);

  // Trading DNA (radar chart)
  const avgMental = completed.length ? completed.reduce((s, t) => s + (t.mentalState || 7), 0) / completed.length : 7;
  const avgEntry = completed.length ? completed.reduce((s, t) => s + (t.entryQuality || 7), 0) / completed.length : 7;
  const avgExit = completed.length ? completed.reduce((s, t) => s + (t.exitQuality || 7), 0) / completed.length : 7;
  const rulesCompliancePct = completed.filter(t => t.rulesFollowed !== undefined).length
    ? completed.filter(t => t.rulesFollowed).length / completed.filter(t => t.rulesFollowed !== undefined).length * 10
    : 7;
  const avgExecScore = completed.filter(t => t.executionScore).length
    ? completed.reduce((s, t) => s + (t.executionScore || 70), 0) / completed.filter(t => t.executionScore).length / 10
    : 7;
  const avgPsychReadiness = logs.length
    ? logs.slice(0, 14).reduce((s, l) => s + l.tradingReadiness, 0) / Math.min(14, logs.length)
    : 7;

  const dnaData = [
    { subject: "Psychology", value: dnaScore(avgPsychReadiness), fullMark: 100 },
    { subject: "Entry Quality", value: dnaScore(avgEntry), fullMark: 100 },
    { subject: "Exit Quality", value: dnaScore(avgExit), fullMark: 100 },
    { subject: "Rule Compliance", value: dnaScore(rulesCompliancePct), fullMark: 100 },
    { subject: "Execution", value: dnaScore(avgExecScore), fullMark: 100 },
    { subject: "Mental State", value: dnaScore(avgMental), fullMark: 100 },
  ];

  // Progression (strategy wins over time split by month)
  const monthlyPnL = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach(t => {
      const mo = new Date(t.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      map[mo] = (map[mo] || 0) + (t.pnl || 0);
    });
    return Object.entries(map).slice(-6).map(([month, pnl]) => ({ month, pnl: Math.round(pnl) }));
  }, [completed]);

  // Trader level computation
  const traderLevel = useMemo(() => {
    let pts = 0;
    if (completed.length >= 10) pts += 20;
    if (completed.length >= 50) pts += 20;
    if (metrics.winRate >= 0.5) pts += 15;
    if (metrics.profitFactor >= 1.5) pts += 15;
    if (metrics.avgRulesFollowed >= 70) pts += 15;
    if (metrics.sharpeRatio >= 1) pts += 15;
    return { score: Math.min(pts, 100), label: pts >= 80 ? 'Elite' : pts >= 60 ? 'Advanced' : pts >= 40 ? 'Intermediate' : pts >= 20 ? 'Developing' : 'Beginner' };
  }, [completed, metrics]);

  if (loading) return <div className="flex h-full items-center justify-center text-muted-foreground">{t('common.loading')}</div>;

  if (completed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <TrendingUp className="w-16 h-16 text-muted-foreground/30" />
        <div className="text-center">
          <div className="text-xl font-bold mb-2">No Trade Data Yet</div>
          <p className="text-muted-foreground text-sm max-w-xs">Record at least 5 trades to unlock your Trading Evolution profile and DNA analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.evolution')}</h1>
        <p className="text-muted-foreground text-sm mt-1">Your trader DNA, strengths, and growth trajectory — all computed from your real trades.</p>
      </div>

      {/* Trader Level */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-6">
            <div className="text-center shrink-0">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40 mb-1">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <Badge className="text-xs">{traderLevel.label}</Badge>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold">Trader Development Score</span>
                <span className="font-bold text-primary">{traderLevel.score}/100</span>
              </div>
              <Progress value={traderLevel.score} className="h-2.5" />
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div><div className="text-xs text-muted-foreground">Trades</div><div className="font-semibold">{completed.length}</div></div>
                <div><div className="text-xs text-muted-foreground">Cycles</div><div className="font-semibold">{cycles.length}</div></div>
                <div><div className="text-xs text-muted-foreground">Psych Logs</div><div className="font-semibold">{logs.length}</div></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading DNA Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-4 h-4" /> Trading DNA</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dnaData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Radar name="DNA" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly P&L */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Monthly P&L</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {monthlyPnL.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPnL}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }}
                      formatter={(v: any) => [`$${v}`, 'P&L']} />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {monthlyPnL.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#ef4444'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-500/20">
          <CardHeader><CardTitle className="text-green-500 flex items-center gap-2"><Star className="w-4 h-4" /> Strengths</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {bestSession && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Best Session: {bestSession.session}</div>
                  <div className="text-xs text-muted-foreground">${bestSession.pnl.toFixed(0)} total, {bestSession.winRate}% win rate over {bestSession.count} trades</div>
                </div>
              </div>
            )}
            {bestStrategy && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Best Strategy: {bestStrategy.strategy}</div>
                  <div className="text-xs text-muted-foreground">${bestStrategy.pnl.toFixed(0)} profit, {bestStrategy.winRate}% win rate</div>
                </div>
              </div>
            )}
            {bestEmotion && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Best State: {bestEmotion.emotion}</div>
                  <div className="text-xs text-muted-foreground">Avg {bestEmotion.avgR}R per trade, {bestEmotion.winRate}% win rate</div>
                </div>
              </div>
            )}
            {metrics.consecutiveWins >= 3 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Max Winning Streak</div>
                  <div className="text-xs text-muted-foreground">{metrics.consecutiveWins} consecutive wins — strong momentum</div>
                </div>
              </div>
            )}
            {aPlusTrades.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">A+ Trades: {aPlusTrades.length}</div>
                  <div className="text-xs text-muted-foreground">Trades with quality score ≥ 80 — your best executions</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Areas to Improve</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {worstSession && worstSession.pnl < 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <div className="text-sm font-medium">Weak Session: {worstSession.session}</div>
                  <div className="text-xs text-muted-foreground">${worstSession.pnl.toFixed(0)} total — reduce size or skip this session</div>
                </div>
              </div>
            )}
            {worstStrategy && worstStrategy.pnl < 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <div className="text-sm font-medium">Weakest Strategy: {worstStrategy.strategy}</div>
                  <div className="text-xs text-muted-foreground">${worstStrategy.pnl.toFixed(0)} loss — review or pause this strategy</div>
                </div>
              </div>
            )}
            {metrics.avgRulesFollowed < 70 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <div className="text-sm font-medium">Rule Compliance: {metrics.avgRulesFollowed.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Below 70% — build a stricter pre-trade checklist</div>
                </div>
              </div>
            )}
            {metrics.consecutiveLosses >= 3 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <div className="text-sm font-medium">Losing Streaks Up to {metrics.consecutiveLosses}</div>
                  <div className="text-xs text-muted-foreground">Consider a 2-loss daily stop rule to protect capital</div>
                </div>
              </div>
            )}
            {metrics.maxDrawdownPct > 15 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-destructive rotate-180" />
                </div>
                <div>
                  <div className="text-sm font-medium">Max Drawdown: {metrics.maxDrawdownPct.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">High drawdown — review risk management rules</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Process vs Result Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Process vs Result Matrix</CardTitle>
          <p className="text-xs text-muted-foreground">A profitable trade with poor process is dangerous. A losing trade with good process is progress.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
              <div className="text-2xl font-bold text-green-500">{goodProcessGoodResult}</div>
              <div className="text-xs text-muted-foreground mt-1">Good Process + Win</div>
              <div className="text-xs text-green-400 font-medium">Ideal</div>
            </div>
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
              <div className="text-2xl font-bold text-yellow-500">{badProcessGoodResult}</div>
              <div className="text-xs text-muted-foreground mt-1">Poor Process + Win</div>
              <div className="text-xs text-yellow-400 font-medium">Lucky — dangerous pattern</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <div className="text-2xl font-bold text-blue-400">{goodProcessBadResult}</div>
              <div className="text-xs text-muted-foreground mt-1">Good Process + Loss</div>
              <div className="text-xs text-blue-400 font-medium">Learning — keep it up</div>
            </div>
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
              <div className="text-2xl font-bold text-destructive">{badProcessBadResult}</div>
              <div className="text-xs text-muted-foreground mt-1">Poor Process + Loss</div>
              <div className="text-xs text-destructive font-medium">Fix this immediately</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
