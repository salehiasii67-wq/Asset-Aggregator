import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useTrades } from "../hooks/useTrades";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Filter, Plus, ArrowRight, ArrowLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { TradeDialog } from "../components/TradeDialog";

export default function Journal() {
  const { t } = useTranslation();
  const { trades, loading } = useTrades();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useLocation();

  const isNewTradeOpen = location.includes("new=true");

  if (loading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">{t('common.loading')}</div>;
  }

  const filteredTrades = trades.filter(trade => 
    trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.strategy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.journal')}</h1>
        <Button onClick={() => setLocation('/journal?new=true')} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          {t('dashboard.newTrade')}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search symbol, strategy..." 
                className="pl-9 bg-secondary/50 border-secondary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="data-table-header w-24">Date</th>
                    <th className="data-table-header">Symbol</th>
                    <th className="data-table-header">Direction</th>
                    <th className="data-table-header">Strategy</th>
                    <th className="data-table-header">Session</th>
                    <th className="data-table-header text-right">P&L</th>
                    <th className="data-table-header text-right">R</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="data-table-cell text-center py-8 text-muted-foreground">
                        {t('common.noData')}
                      </td>
                    </tr>
                  ) : (
                    filteredTrades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-muted/30 transition-colors cursor-pointer border-b last:border-0 group">
                        <td className="data-table-cell text-muted-foreground whitespace-nowrap">
                          {new Date(trade.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                        </td>
                        <td className="data-table-cell font-bold">{trade.symbol}</td>
                        <td className="data-table-cell">
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trade.direction === 'long' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                            {trade.direction === 'long' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {t(`trade.${trade.direction}`)}
                          </div>
                        </td>
                        <td className="data-table-cell">{trade.strategy}</td>
                        <td className="data-table-cell capitalize">{trade.sessionType}</td>
                        <td className={`data-table-cell text-right font-medium ${trade.outcome === 'win' ? 'text-success' : trade.outcome === 'loss' ? 'text-destructive' : ''}`}>
                          {trade.pnl != null ? `$${trade.pnl.toFixed(2)}` : '-'}
                        </td>
                        <td className="data-table-cell text-right font-medium text-muted-foreground">
                          {trade.pnlR != null ? `${trade.pnlR}R` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <TradeDialog 
        open={isNewTradeOpen} 
        onOpenChange={(open) => !open && setLocation('/journal')} 
      />
    </div>
  );
}