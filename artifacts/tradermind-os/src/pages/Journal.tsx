import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTrades } from "../hooks/useTrades";
import { Trade } from "../db/database";
import { TradeWizard } from "../components/TradeWizard";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Search, Plus, Filter, X, ChevronUp, ChevronDown,
  BookOpen, Target, Brain, Shield, Edit2, Trash2, AlertTriangle
} from "lucide-react";

function TradeDetail({ trade, onClose, onEdit, onDelete }: {
  trade: Trade; onClose: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const { t } = useTranslation();
  const isWin = trade.outcome === 'win';
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-lg">{trade.symbol}</span>
            <Badge variant={isWin ? "default" : "destructive"}
              className={isWin ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
              {trade.outcome === 'win' ? t('trade.win') : trade.outcome === 'loss' ? t('trade.loss') : t('trade.breakeven')}
            </Badge>
            {trade.tradeQualityScore !== undefined && (
              <Badge variant="secondary" className="ml-auto">
                {t('journal.detail.quality')}: {trade.tradeQualityScore}/100
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-secondary/30 text-center">
              <div className="text-xs text-muted-foreground mb-1">{t('journal.detail.pnl')}</div>
              <div className={cn("text-xl font-bold", isWin ? "text-green-400" : "text-destructive")}>
                {trade.pnl !== undefined ? `$${trade.pnl.toFixed(0)}` : '—'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 text-center">
              <div className="text-xs text-muted-foreground mb-1">{t('journal.detail.rMultiple')}</div>
              <div className={cn("text-xl font-bold", (trade.pnlR || 0) >= 0 ? "text-green-400" : "text-destructive")}>
                {trade.pnlR !== undefined ? `${trade.pnlR > 0 ? '+' : ''}${trade.pnlR}R` : '—'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 text-center">
              <div className="text-xs text-muted-foreground mb-1">{t('journal.detail.risk')}</div>
              <div className="text-xl font-bold">{trade.riskPercent}%</div>
            </div>
          </div>

          {/* Trade Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('journal.detail.direction')}</span>
                <span className={cn("font-medium", trade.direction === 'long' ? 'text-green-400' : 'text-red-400')}>
                  {trade.direction === 'long' ? t('wizard.step1.directionLong') : t('wizard.step1.directionShort')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('journal.detail.session')}</span>
                <span className="font-medium">{trade.sessionType === 'london' ? t('wizard.step1.sessionLondon') : trade.sessionType === 'ny' ? t('wizard.step1.sessionNY') : trade.sessionType === 'asian' ? t('wizard.step1.sessionAsian') : t('wizard.step1.sessionOverlap')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('journal.detail.strategy')}</span>
                <span className="font-medium">{trade.strategy || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('journal.detail.entry')}</span>
                <span className="font-mono text-xs">{trade.entryPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('journal.detail.stopLoss')}</span>
                <span className="font-mono text-xs">{trade.stopLoss}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('journal.detail.date')}</span>
                <span className="font-medium">{new Date(trade.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('journal.detail.condition')}</span>
                <span className="font-medium">
                  {trade.marketCondition ? (
                    trade.marketCondition === 'trending' ? t('wizard.step2.conditionTrending') :
                    trade.marketCondition === 'ranging' ? t('wizard.step2.conditionRanging') :
                    trade.marketCondition === 'breakout' ? t('wizard.step2.conditionBreakout') :
                    t('wizard.step2.conditionReversal')
                  ) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('journal.detail.setupType')}</span>
                <span className="font-medium">{trade.setupType || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('journal.detail.takeProfit')}</span>
                <span className="font-mono text-xs">{trade.takeProfit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('journal.detail.exit')}</span>
                <span className="font-mono text-xs">{trade.exitPrice || '—'}</span>
              </div>
            </div>
          </div>

          {/* Execution Quality */}
          <div className="p-3 rounded-lg bg-secondary/20 border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('journal.detail.executionQuality')}</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-muted-foreground">{t('journal.detail.entryQuality')}</div>
                <div className="font-bold text-lg">{trade.entryQuality}/10</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t('journal.detail.exitQuality')}</div>
                <div className="font-bold text-lg">{trade.exitQuality}/10</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t('journal.detail.mentalState')}</div>
                <div className="font-bold text-lg">{trade.mentalState}/10</div>
              </div>
            </div>
            <div className="flex gap-4 mt-3 justify-center text-xs flex-wrap">
              <span className={cn("flex items-center gap-1", trade.rulesFollowed ? 'text-green-400' : 'text-destructive')}>
                <Shield className="w-3 h-3" /> {trade.rulesFollowed ? t('journal.detail.rulesFollowed') : t('journal.detail.rulesBroken')}
              </span>
              {trade.followedPlan !== undefined && (
                <span className={cn("flex items-center gap-1", trade.followedPlan ? 'text-green-400' : 'text-destructive')}>
                  <Target className="w-3 h-3" /> {trade.followedPlan ? t('journal.detail.planFollowed') : t('journal.detail.planDeviated')}
                </span>
              )}
            </div>
          </div>

          {/* Psychology */}
          {(trade.preTradeEmotion || trade.preConfidence) && (
            <div className="p-3 rounded-lg bg-secondary/20 border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> {t('journal.detail.psychology')}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {trade.preTradeEmotion && <div><span className="text-muted-foreground">{t('journal.detail.preEmotion')}:</span> <span className="capitalize">{trade.preTradeEmotion}</span></div>}
                {trade.postEmotion && <div><span className="text-muted-foreground">{t('journal.detail.postEmotion')}:</span> <span className="capitalize">{trade.postEmotion}</span></div>}
                {trade.preConfidence && <div><span className="text-muted-foreground">{t('journal.detail.confidence')}:</span> {trade.preConfidence}/10</div>}
                {trade.preStress && <div><span className="text-muted-foreground">{t('journal.detail.stress')}:</span> {trade.preStress}/10</div>}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {trade.hesitated && <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">{t('journal.detail.hesitated')}</Badge>}
                {trade.rushed && <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">{t('journal.detail.rushed')}</Badge>}
                {trade.brokRules && <Badge variant="destructive" className="text-xs bg-destructive/15 text-destructive border-destructive/30">{t('journal.detail.brokRules')}</Badge>}
                {trade.emotionAffectedDecision && <Badge variant="outline" className="text-xs text-red-400 border-red-500/30">{t('journal.detail.emotionDriven')}</Badge>}
              </div>
            </div>
          )}

          {/* Rationale */}
          {trade.tradeRationale && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('journal.detail.rationale')}</div>
              <p className="text-sm text-muted-foreground">{trade.tradeRationale}</p>
            </div>
          )}

          {/* Review */}
          {(trade.whatWentRight || trade.whatWentWrong || trade.lessonLearned) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('journal.detail.review')}</div>
              {trade.whatWentRight && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-xs text-green-400 font-semibold mb-1">✓ {t('journal.detail.whatWentRight')}</div>
                  <p className="text-sm">{trade.whatWentRight}</p>
                </div>
              )}
              {trade.whatWentWrong && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="text-xs text-destructive font-semibold mb-1">✗ {t('journal.detail.whatWentWrong')}</div>
                  <p className="text-sm">{trade.whatWentWrong}</p>
                </div>
              )}
              {trade.lessonLearned && (
                <div className="p-3 rounded-lg bg-secondary/30 border">
                  <div className="text-xs text-primary font-semibold mb-1">→ {t('journal.detail.lessonLearned')}</div>
                  <p className="text-sm">{trade.lessonLearned}</p>
                </div>
              )}
            </div>
          )}

          {/* Setup Notes */}
          {trade.setupNotes && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('journal.detail.setupNotes')}</div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{trade.setupNotes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
              <Edit2 className="w-3.5 h-3.5" /> {t('journal.editTrade')}
            </Button>
            <Button variant="destructive" size="sm"
              className={cn("gap-1.5 ml-auto", confirmDelete ? "bg-destructive" : "bg-destructive/20 text-destructive hover:bg-destructive")}
              onClick={handleDelete}>
              {confirmDelete ? <AlertTriangle className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
              {confirmDelete ? t('journal.deleteConfirm') : t('journal.deleteTrade')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type SortKey = 'date' | 'pnl' | 'pnlR' | 'entryQuality';
type SortDir = 'asc' | 'desc';

export default function Journal() {
  const { t } = useTranslation();
  const { trades, loading, deleteTrade } = useTrades();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);
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

  const handleDelete = async (trade: Trade) => {
    if (trade.id) {
      await deleteTrade(trade.id);
      setSelectedTrade(null);
    }
  };

  const handleEdit = (trade: Trade) => {
    setSelectedTrade(null);
    setEditTrade(trade);
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
          <Plus className="w-4 h-4" /> {t('journal.newTrade')}
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t('journal.searchPlaceholder')} className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(f => !f)} className={cn(showFilters && "border-primary text-primary")}>
            <Filter className="w-4 h-4" />
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters} title={t('journal.clearFilters')}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 bg-card border rounded-xl">
            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('journal.filterAllResults')}</SelectItem>
                <SelectItem value="win">{t('journal.filterWin')}</SelectItem>
                <SelectItem value="loss">{t('journal.filterLoss')}</SelectItem>
                <SelectItem value="breakeven">{t('journal.filterBreakeven')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sessionFilter} onValueChange={setSessionFilter}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('journal.filterAllSessions')}</SelectItem>
                <SelectItem value="london">{t('journal.filterLondon')}</SelectItem>
                <SelectItem value="ny">{t('journal.filterNY')}</SelectItem>
                <SelectItem value="asian">{t('journal.filterAsian')}</SelectItem>
                <SelectItem value="overlap">{t('journal.filterOverlap')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('journal.filterBoth')}</SelectItem>
                <SelectItem value="long">{t('journal.filterLong')}</SelectItem>
                <SelectItem value="short">{t('journal.filterShort')}</SelectItem>
              </SelectContent>
            </Select>
            {allStrategies.length > 0 && (
              <Select value={strategyFilter} onValueChange={setStrategyFilter}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('journal.filterAllStrategies')}</SelectItem>
                  {allStrategies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Input type="date" className="w-36 h-8 text-xs" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <Input type="date" className="w-36 h-8 text-xs" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        )}
        {hasFilters && (
          <div className="text-xs text-muted-foreground">
            {t('journal.showing', { count: filtered.length, total: trades.length })}
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
                <div className="font-medium mb-1">{hasFilters ? t('journal.noFilterMatch') : t('journal.noTradesYet')}</div>
                <p className="text-sm text-muted-foreground">{hasFilters ? t('journal.noFilterMatchHint') : t('journal.noTradesYetHint')}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      <button onClick={() => handleSort('date')} className="hover:text-foreground transition-colors">{t('journal.colDate')} <SortIcon k="date" /></button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{t('journal.colSymbol')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">{t('journal.colStrategy')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">{t('journal.colSession')}</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">{t('journal.colResult')}</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                      <button onClick={() => handleSort('pnl')} className="hover:text-foreground transition-colors">{t('journal.colPnL')} <SortIcon k="pnl" /></button>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                      <button onClick={() => handleSort('pnlR')} className="hover:text-foreground transition-colors">{t('journal.colR')} <SortIcon k="pnlR" /></button>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                      <button onClick={() => handleSort('entryQuality')} className="hover:text-foreground transition-colors">{t('journal.colQuality')} <SortIcon k="entryQuality" /></button>
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
                          <Badge variant="outline" className="text-xs capitalize">{
                            trade.sessionType === 'london' ? t('wizard.step1.sessionLondon') :
                            trade.sessionType === 'ny' ? t('wizard.step1.sessionNY') :
                            trade.sessionType === 'asian' ? t('wizard.step1.sessionAsian') :
                            t('wizard.step1.sessionOverlap')
                          }</Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {trade.outcome ? (
                            <Badge className={cn("text-xs",
                              isWin ? "bg-green-500/15 text-green-400 border-green-500/30" :
                              isLoss ? "bg-destructive/15 text-destructive border-destructive/30" :
                              "bg-secondary text-muted-foreground")}>
                              {isWin ? t('journal.filterWin') : isLoss ? t('journal.filterLoss') : t('journal.filterBreakeven')}
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

      <TradeWizard open={wizardOpen} onOpenChange={setWizardOpen} mode="add" />
      <TradeWizard
        open={!!editTrade}
        onOpenChange={(o) => !o && setEditTrade(null)}
        initialData={editTrade || undefined}
        mode="edit"
      />
      {selectedTrade && (
        <TradeDetail
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onEdit={() => handleEdit(selectedTrade)}
          onDelete={() => handleDelete(selectedTrade)}
        />
      )}
    </div>
  );
}
