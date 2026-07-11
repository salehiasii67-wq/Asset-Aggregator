import { Trade } from '../db/database';

export function calculateMetrics(trades: Trade[]) {
  const completedTrades = trades.filter(t => t.status === 'completed' && t.pnl !== undefined);
  
  if (completedTrades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      netPnL: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      expectancy: 0,
      avgR: 0,
      maxDrawdown: 0
    };
  }

  const wins = completedTrades.filter(t => t.outcome === 'win');
  const losses = completedTrades.filter(t => t.outcome === 'loss');
  
  const totalTrades = completedTrades.length;
  const winRate = totalTrades > 0 ? wins.length / totalTrades : 0;
  
  const netPnL = completedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  
  const totalWinAmount = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalLossAmount = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));
  
  const avgWin = wins.length > 0 ? totalWinAmount / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLossAmount / losses.length : 0;
  
  const profitFactor = totalLossAmount === 0 ? (totalWinAmount > 0 ? Infinity : 0) : totalWinAmount / totalLossAmount;
  
  const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss);
  
  const avgR = completedTrades.reduce((sum, t) => sum + (t.pnlR || 0), 0) / totalTrades;
  
  // Calculate max drawdown
  let maxDrawdown = 0;
  let peak = 0;
  let runningEquity = 0;
  
  // Sort trades by date to calculate equity curve
  const sortedTrades = [...completedTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  sortedTrades.forEach(t => {
    runningEquity += (t.pnl || 0);
    if (runningEquity > peak) {
      peak = runningEquity;
    }
    const drawdown = peak - runningEquity;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return {
    totalTrades,
    winRate,
    netPnL,
    avgWin,
    avgLoss,
    profitFactor,
    expectancy,
    avgR,
    maxDrawdown
  };
}