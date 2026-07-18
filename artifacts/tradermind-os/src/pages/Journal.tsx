import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTrades } from "../hooks/useTrades";
import { Trade } from "../db/database";
import { TradeWizard } from "../components/TradeWizard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Search, Plus, TrendingUp, TrendingDown, Filter, X, ChevronUp, ChevronDown,
  BookOpen, Star, Target, Brain, Shield
} from "lucide-react";

function TradeDetail({ trade, onClose }: { trade: Trade; onClose: () => void }) {
  const isWin = trade.outcome === 'win';
  const qualityScore = trade.tradeQualityScore;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-lg">{trade.symbol}</span>
            <Badge variant={isWin ? "default" : "destructive"} className={isWin ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
              {trade.outcome?.toUpperCase() || 'N/A'}
            </Badge>
            {qualityScore !== undefined && (
              <Badge variant="secondary" className="ml-auto">
                Quality: {qualityScore}/100
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-secondary/30 text-center">
              <div className="text-xs text-muted-foreground mb-1">P&L</div>
              <div className={cn("text-xl font-bold", isWin ? "text-green-400" : "text-destructive")}>
                {trade.pnl !== undefined ? `$${trade.pnl.toFixed(0)}` : '—'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 text-center">
              <div className="text-xs text-muted-foreground mb-1">R Multiple</div>
              <div className={cn("text-xl font-bold", (trade.pnlR || 0) >= 0 ? "text-green-400" : "text-destructive")}>
                {trade.pnlR !== undefined ? `${trade.pnlR > 0 ? '+' : ''}${trade.pnlR}R` : '—'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 text-center">
              <div className="text-xs text-muted-foreground mb-1">Risk</div>
              <div className="text-xl font-bold">{trade.riskPercent}%</div>
            </div>
          </div>

          {/* Trade Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Direction</span>
                <span className={cn("font-medium", trade.direction === 'long' ? 'text-green-400' : 'text-red-400')}>
                  {trade.direction?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session</span>
                <span className="font-medium capitalize">{trade.sessionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Strategy</span>
                <span className="font-medium">{trade.strategy || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entry</span>
                <span className="font-mono text-xs">{trade.entryPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stop Loss</span>
                <span className="font-mono text-xs">{trade.stopLoss}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{new Date(trade.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition</span>
                <span className="font-medium capitalize">{trade.marketCondition || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Setup Type</span>
                <span className="font-medium">{trade.setupType || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Take Profit</span>
                <span className="font-mono text-xs">{trade.takeProfit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exit</span>
                <span className="font-mono text-xs">{trade.exitPrice || '—'}</span>
              </div>
            </div>
          </div>

          {/* Execution Scores */}
          <div className="p-3 rounded-lg bg-secondary/20 border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Execution Quality</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-muted-foreground">Entry Quality</div>
                <div className="font-bold text-lg">{trade.entryQuality}/10</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Exit Quality</div>
                <div className="font-bold text-lg">{trade.exitQuality}/10</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Mental State</div>
                <div className="font-bold text-lg">{trade.mentalState}/10</div>
              </div>
            </div>
            <div className="flex gap-4 mt-3 justify-center text-xs">
              <span className={cn("flex items-center gap-1", trade.rulesFollowed ? 'text-green-400' : 'text-destructive')}>
                <Shield className="w-3 h-3" /> {trade.rulesFollowed ? 'Rules followed' : 'Rules broken'}
              </span>
              {trade.followedPlan !== undefined && (
                <span className={cn("flex items-center gap-1", trade.followedPlan ? 'text-green-400' : 'text-destructive')}>
                  <Target className="w-3 h-3" /> {trade.followedPlan ? 'Plan followed' : 'Plan deviated'}
                </span>
              )}
            </div>
          </div>

          {/* Psychology */}
          {(trade.preTradeEmotion || trade.preConfidence) && (
            <div className="p-3 rounded-lg bg-secondary/20 border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> Psychology
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {trade.preTradeEmotion && <div><span className="text-muted-foreground">Pre-Emotion:</span> <span className="capitalize">{trade.preTradeEmotion}</span></div>}
                {trade.postEmotion && <div><span className="text-muted-foreground">Post-Emotion:</span> <span className="capitalize">{trade.postEmotion}</span></div>}
                {trade.preConfidence && <div><span className="text-muted-foreground">Confidence:</span> {trade.preConfidence}/10</div>}
                {trade.preStress && <div><span className="text-muted-foreground">Stress:</span> {trade.preStress}/10</div>}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {trade.hesitated && <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">Hesitated</Badge>}
                {trade.rushed && <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">Rushed</Badge>}
                {trade.brokRules && <Badge variant="destructive" className="text-xs bg-destructive/15 text-destructive border-destructive/30">Broke Rules</Badge>}
                {trade.emotionAffectedDecision && <Badge variant="outline" className="text-xs text-red-400 border-red-500/30">Emotion drove decision</Badge>}
              </div>
            </div>
          )}

          {/* Trade Rationale */}
          {trade.tradeRationale && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Trade Rationale</div>
              <p className="text-sm text-muted-foreground">{trade.tradeRationale}</p>
            </div>
          )}

          {/* Review */}
          {(trade.whatWentRight || trade.whatWentWrong || trade.lessonLearned) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trade Review</div>
              {trade.whatWentRight && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-xs text-green-400 font-semibold mb-1">✓ What went right</div>
                  <p className="text-sm">{trade.whatWentRight}</p>
                </div>
              )}
              {trade.whatWentWrong && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="text-xs text-destructive font-semibold mb-1">✗ What went wrong</div>
                  <p className="text-sm">{trade.whatWentWrong}</p>
                </div>
              )}
              {trade.lessonLearned && (
                <div className="p-3 rounded-lg bg-secondary/30 border">
                  <div className="text-xs text-primary font-semibold mb-1">→ Lesson learned</div>
                  <p className="text-sm">{trade.lessonLearned}</p>
                </div>
              )}
            </div>
          )}

          {/* Setup Notes */}
          {trade.setupNotes && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Setup Notes</div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{trade.setupNotes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type SortKey = 'date' | 'pnl' | 'pnlR' | 'entryQuality';
type SortDir = 'asc' | 'desc';

export default function Journal() {
  const { t } = useTranslation();
  const { trades, loading } = useTrades();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [strategyFilter, setStrategyFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const allStrategies = [...new Set(trades.map(t => t.strategy).filter(Boolean))];
  const hasFilters = outcomeFilter !== 'all' || sessionFilter !== 'all' || directionFilter !== 'all' || strategyFilter !== 'all' || dateFrom || dateTo || search;

  const clearFilters = () => {
    setOutcomeFilter('all'); setSessionFilter('all'); setDirectionFilter('all');
    setStrategyFilter('all'); setDateFrom(''); setDateTo(''); setSearch('');
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    let result = [...trades];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.symbol.toLowerCase().includes(q) || t.strategy?.toLowerCase().includes(q) || t.setupNotes?.toLowerCase().includes(q) || t.lessonLearned?.toLowerCase().includes(q));
    }
    if (outcomeFilter !== 'all') result = result.filter(t => t.outcome === outcomeFilter);
    if (sessionFilter !== 'all') result = result.filter(t => t.sessionType === sessionFilter);
    if (directionFilter !== 'all') result = result.filter(t => t.direction === directionFilter);
    if (strategyFilter !== 'all') result = result.filter(t => t.strategy === strategyFilter);
    if (dateFrom) result = result.filter(t => t.date >= dateFrom);
    if (dateTo) result = result.filter(t => t.date <= dateTo);

    result.sort((a, b) => {
      let av = 0, bv = 0;
      if (sortKey === 'date') { av = new Date(a.date).getTime(); bv = new Date(b.date).getTime(); }
      else if (sortKey === 'pnl') { av = a.pnl || 0; bv = b.pnl || 0; }
      else if (sortKey === 'pnlR') { av = a.pnlR || 0; bv = b.pnlR || 0; }
      else if (sortKey === 'entryQuality') { av = a.entryQuality || 0; bv = b.entryQuality || 0; }
      return sortDir === 'desc' ? bv - av : av - bv;
    });
    return result;
  }, [trades, search, outcomeFilter, sessionFilter, directionFilter, strategyFilter, dateFrom, dateTo, sortKey, sortDir]);

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k ? (sortDir === 'desc' ? <ChevronDown className="w-3 h-3 inline ml-0.5" /> : <ChevronUp className="w-3 h-3 inline ml-0.5" />) : null;

  if (loading) return <div className="flex h-full items-center justify-center text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.journal')}</h1>
        <Button onClick={() => setWizardOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Trade
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search symbol, strategy, notes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(f => !f)} className={cn(showFilters && "border-primary text-primary")}>
            <Filter className="w-4 h-4" />
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 bg-card border rounded-xl">
            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Outcome" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="win">Win</SelectItem>
                <SelectItem value="loss">Loss</SelectItem>
                <SelectItem value="breakeven">Breakeven</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sessionFilter} onValueChange={setSessionFilter}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Session" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="london">London</SelectItem>
                <SelectItem value="ny">New York</SelectItem>
                <SelectItem value="asian">Asian</SelectItem>
                <SelectItem value="overlap">Overlap</SelectItem>
              </SelectContent>
            </Select>
            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Direction" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Both</SelectItem>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
            {allStrategies.length > 0 && (
              <Select value={strategyFilter} onValueChange={setStrategyFilter}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Strategy" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Strategies</SelectItem>
                  {allStrategies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Input type="date" className="w-36 h-8 text-xs" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <Input type="date" className="w-36 h-8 text-xs" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        )}

        {hasFilters && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Showing {filtered.length} of {trades.length} trades</span>
          </div>
        )}
      </div>

      {/* Trade Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <BookOpen className="w-10 h-10 text-muted-foreground/40" />
              <div className="text-center">
                <div className="font-medium mb-1">{hasFilters ? 'No trades match filters' : 'No trades yet'}</div>
                <p className="text-sm text-muted-foreground">{hasFilters ? 'Try adjusting your filters' : 'Click "New Trade" to log your first trade'}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      <button onClick={() => handleSort('date')} className="hover:text-foreground transition-colors">Date <SortIcon k="date" /></button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Symbol</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Strategy</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Session</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Result</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                      <button onClick={() => handleSort('pnl')} className="hover:text-foreground transition-colors">P&L <SortIcon k="pnl" /></button>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                      <button onClick={() => handleSort('pnlR')} className="hover:text-foreground transition-colors">R <SortIcon k="pnlR" /></button>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                      <button onClick={() => handleSort('entryQuality')} className="hover:text-foreground transition-colors">Quality <SortIcon k="entryQuality" /></button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(trade => {
                    const isWin = trade.outcome === 'win';
                    const isLoss = trade.outcome === 'loss';
                    return (
                      <tr key={trade.id} onClick={() => setSelectedTrade(trade)}
                        className="border-b border-border/40 last:border-0 hover:bg-secondary/30 cursor-pointer transition-colors group">
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(trade.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-sm">{trade.symbol}</span>
                            <span className={cn("text-xs font-medium", trade.direction === 'long' ? 'text-green-400' : 'text-red-400')}>
                              {trade.direction === 'long' ? '▲' : '▼'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{trade.strategy || '—'}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge variant="outline" className="text-xs capitalize">{trade.sessionType}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {trade.outcome ? (
                            <Badge className={cn("text-xs capitalize",
                              isWin ? "bg-green-500/15 text-green-400 border-green-500/30" :
                              isLoss ? "bg-destructive/15 text-destructive border-destructive/30" :
                              "bg-secondary text-muted-foreground")}>
                              {trade.outcome}
                            </Badge>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className={cn("px-4 py-3 text-right font-semibold text-sm",
                          isWin ? 'text-green-400' : isLoss ? 'text-destructive' : '')}>
                          {trade.pnl !== undefined ? (trade.pnl >= 0 ? '+' : '') + '$' + Math.abs(trade.pnl).toFixed(0) : '—'}
                        </td>
                        <td className={cn("px-4 py-3 text-right text-sm hidden sm:table-cell",
                          (trade.pnlR || 0) >= 0 ? 'text-green-400' : 'text-destructive')}>
                          {trade.pnlR !== undefined ? (trade.pnlR > 0 ? '+' : '') + trade.pnlR + 'R' : '—'}
                        </td>
                        <td className="px-4 py-3 text-right hidden lg:table-cell">
                          {trade.tradeQualityScore !== undefined ? (
                            <span className={cn("text-sm font-semibold",
                              trade.tradeQualityScore >= 70 ? 'text-green-400' :
                              trade.tradeQualityScore >= 50 ? 'text-yellow-400' : 'text-destructive')}>
                              {trade.tradeQualityScore}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <TradeWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      {selectedTrade && <TradeDetail trade={selectedTrade} onClose={() => setSelectedTrade(null)} />}
    </div>
  );
}
