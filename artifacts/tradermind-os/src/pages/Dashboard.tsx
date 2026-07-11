import { useTranslation } from "react-i18next";
import { useTrades } from "../hooks/useTrades";
import { useProfile } from "../hooks/useProfile";
import { calculateMetrics } from "../lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Target, 
  Activity, 
  Wallet, 
  PlusCircle,
  History,
  Brain
} from "lucide-react";
import { useGrowthCycles } from "../hooks/useGrowthCycles";

export default function Dashboard() {
  const { t } = useTranslation();
  const { trades, loading: tradesLoading } = useTrades();
  const { profile, loading: profileLoading } = useProfile();
  const { cycles } = useGrowthCycles();

  if (tradesLoading || profileLoading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">{t('common.loading')}</div>;
  }

  const metrics = calculateMetrics(trades);
  const activeCycle = cycles.find(c => c.status === 'active');
  const recentTrades = trades.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.welcome')}, {profile?.name || 'Trader'}</h1>
          <p className="text-muted-foreground mt-1">
            {t('dashboard.maturityLevel')}: Level {profile?.level || 1}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/journal?new=true">
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" />
              {t('dashboard.newTrade')}
            </Button>
          </Link>
          <Link href="/psychology">
            <Button variant="outline" className="gap-2">
              <Brain className="w-4 h-4" />
              {t('dashboard.logPsychology')}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.netProfit')}</CardTitle>
            <Wallet className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.netPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${metrics.netPnL.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.winRate')}</CardTitle>
            <Target className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.winRate * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.avgR')}</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgR.toFixed(2)}R</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.totalTrades')}</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrades}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Cycle */}
        <Card className="md:col-span-1 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('dashboard.activeCycle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeCycle ? (
              <div className="space-y-4">
                <div>
                  <div className="font-medium">{activeCycle.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(activeCycle.startDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Focus Areas:</div>
                  <div className="flex flex-wrap gap-2">
                    {activeCycle.focusAreas.map((area, i) => (
                      <span key={i} className="px-2 py-1 bg-background rounded text-xs border">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground flex flex-col items-center justify-center py-6 text-center">
                <p>No active cycle</p>
                <Link href="/growth">
                  <Button variant="link" className="mt-2 text-primary p-0">Start a new cycle</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5" />
              {t('dashboard.recentTrades')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTrades.length > 0 ? (
              <div className="space-y-4">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-10 rounded-full ${trade.outcome === 'win' ? 'bg-success' : trade.outcome === 'loss' ? 'bg-destructive' : 'bg-muted'}`} />
                      <div>
                        <div className="font-bold">{trade.symbol}</div>
                        <div className="text-xs text-muted-foreground">{new Date(trade.date).toLocaleDateString()} • {trade.strategy}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${trade.outcome === 'win' ? 'text-success' : trade.outcome === 'loss' ? 'text-destructive' : ''}`}>
                        {trade.pnl != null ? `$${trade.pnl.toFixed(2)}` : '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {trade.pnlR != null ? `${trade.pnlR}R` : '-'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('common.noData')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}