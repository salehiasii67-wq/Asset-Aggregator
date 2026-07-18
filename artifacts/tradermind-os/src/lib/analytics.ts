import { Trade } from '../db/database';

export function calculateMetrics(trades: Trade[]) {
  const completed = trades.filter(t => t.status === 'completed' && t.pnl !== undefined);
  if (completed.length === 0) {
    return { totalTrades: 0, winRate: 0, netPnL: 0, avgWin: 0, avgLoss: 0, profitFactor: 0, expectancy: 0, avgR: 0, maxDrawdown: 0, maxDrawdownPct: 0, consecutiveWins: 0, consecutiveLosses: 0, avgExecutionScore: 0, avgRulesFollowed: 0, sharpeRatio: 0 };
  }
  const wins = completed.filter(t => t.outcome === 'win');
  const losses = completed.filter(t => t.outcome === 'loss');
  const totalTrades = completed.length;
  const winRate = wins.length / totalTrades;
  const netPnL = completed.reduce((s, t) => s + (t.pnl || 0), 0);
  const totalWin = wins.reduce((s, t) => s + (t.pnl || 0), 0);
  const totalLoss = Math.abs(losses.reduce((s, t) => s + (t.pnl || 0), 0));
  const avgWin = wins.length ? totalWin / wins.length : 0;
  const avgLoss = losses.length ? totalLoss / losses.length : 0;
  const profitFactor = totalLoss === 0 ? (totalWin > 0 ? 999 : 0) : totalWin / totalLoss;
  const expectancy = winRate * avgWin - (1 - winRate) * avgLoss;
  const avgR = completed.reduce((s, t) => s + (t.pnlR || 0), 0) / totalTrades;

  const sorted = [...completed].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let peak = 0, equity = 0, maxDrawdown = 0;
  sorted.forEach(t => {
    equity += t.pnl || 0;
    if (equity > peak) peak = equity;
    const dd = peak - equity;
    if (dd > maxDrawdown) maxDrawdown = dd;
  });
  const maxDrawdownPct = peak > 0 ? (maxDrawdown / peak) * 100 : 0;

  // Consecutive wins/losses
  let maxCW = 0, maxCL = 0, cw = 0, cl = 0;
  sorted.forEach(t => {
    if (t.outcome === 'win') { cw++; cl = 0; maxCW = Math.max(maxCW, cw); }
    else if (t.outcome === 'loss') { cl++; cw = 0; maxCL = Math.max(maxCL, cl); }
  });

  // Sharpe (simplified: avg R / std dev R)
  const rValues = completed.map(t => t.pnlR || 0);
  const meanR = rValues.reduce((s, r) => s + r, 0) / rValues.length;
  const variance = rValues.reduce((s, r) => s + Math.pow(r - meanR, 2), 0) / rValues.length;
  const stdR = Math.sqrt(variance);
  const sharpeRatio = stdR > 0 ? meanR / stdR : 0;

  const avgExecutionScore = completed.filter(t => t.executionScore).reduce((s, t) => s + (t.executionScore || 0), 0) / (completed.filter(t => t.executionScore).length || 1);
  const avgRulesFollowed = completed.filter(t => t.rulesFollowed !== undefined).length
    ? completed.filter(t => t.rulesFollowed).length / completed.filter(t => t.rulesFollowed !== undefined).length * 100
    : 0;

  return { totalTrades, winRate, netPnL, avgWin, avgLoss, profitFactor, expectancy, avgR, maxDrawdown, maxDrawdownPct, consecutiveWins: maxCW, consecutiveLosses: maxCL, sharpeRatio, avgExecutionScore, avgRulesFollowed };
}

export function getEquityCurve(trades: Trade[]) {
  const sorted = [...trades].filter(t => t.status === 'completed' && t.pnl !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let equity = 0;
  return sorted.map((t, i) => {
    equity += t.pnl || 0;
    return { name: `#${i + 1}`, equity: Math.round(equity * 100) / 100, pnl: t.pnl || 0, date: new Date(t.date).toLocaleDateString(), symbol: t.symbol, outcome: t.outcome };
  });
}

export function getStrategyBreakdown(trades: Trade[]) {
  const completed = trades.filter(t => t.status === 'completed' && t.pnl !== undefined);
  const map: Record<string, { pnl: number; count: number; wins: number }> = {};
  completed.forEach(t => {
    if (!map[t.strategy]) map[t.strategy] = { pnl: 0, count: 0, wins: 0 };
    map[t.strategy].pnl += t.pnl || 0;
    map[t.strategy].count += 1;
    if (t.outcome === 'win') map[t.strategy].wins += 1;
  });
  return Object.entries(map).map(([strategy, d]) => ({
    strategy,
    pnl: Math.round(d.pnl * 100) / 100,
    count: d.count,
    winRate: Math.round((d.wins / d.count) * 100),
  })).sort((a, b) => b.pnl - a.pnl);
}

export function getSessionBreakdown(trades: Trade[]) {
  const completed = trades.filter(t => t.status === 'completed' && t.pnl !== undefined);
  const map: Record<string, { pnl: number; count: number; wins: number }> = {};
  completed.forEach(t => {
    if (!map[t.sessionType]) map[t.sessionType] = { pnl: 0, count: 0, wins: 0 };
    map[t.sessionType].pnl += t.pnl || 0;
    map[t.sessionType].count += 1;
    if (t.outcome === 'win') map[t.sessionType].wins += 1;
  });
  return Object.entries(map).map(([session, d]) => ({
    session: session.charAt(0).toUpperCase() + session.slice(1),
    pnl: Math.round(d.pnl * 100) / 100,
    count: d.count,
    winRate: Math.round((d.wins / d.count) * 100),
  }));
}

export function getDayOfWeekBreakdown(trades: Trade[]) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const completed = trades.filter(t => t.status === 'completed' && t.pnl !== undefined);
  const map: Record<number, { pnl: number; count: number; wins: number }> = {};
  completed.forEach(t => {
    const d = new Date(t.date).getDay();
    if (!map[d]) map[d] = { pnl: 0, count: 0, wins: 0 };
    map[d].pnl += t.pnl || 0;
    map[d].count += 1;
    if (t.outcome === 'win') map[d].wins += 1;
  });
  return days.map((day, i) => ({
    day,
    pnl: Math.round((map[i]?.pnl || 0) * 100) / 100,
    count: map[i]?.count || 0,
    winRate: map[i] ? Math.round((map[i].wins / map[i].count) * 100) : 0,
  }));
}

export function getRMultipleDistribution(trades: Trade[]) {
  const completed = trades.filter(t => t.status === 'completed' && t.pnlR !== undefined);
  const buckets: Record<string, number> = {
    '< -2R': 0, '-2R to -1R': 0, '-1R to 0R': 0,
    '0R to 1R': 0, '1R to 2R': 0, '2R to 3R': 0, '> 3R': 0,
  };
  completed.forEach(t => {
    const r = t.pnlR || 0;
    if (r < -2) buckets['< -2R']++;
    else if (r < -1) buckets['-2R to -1R']++;
    else if (r < 0) buckets['-1R to 0R']++;
    else if (r < 1) buckets['0R to 1R']++;
    else if (r < 2) buckets['1R to 2R']++;
    else if (r < 3) buckets['2R to 3R']++;
    else buckets['> 3R']++;
  });
  return Object.entries(buckets).map(([range, count]) => ({ range, count }));
}

export function getEmotionPerformance(trades: Trade[]) {
  const completed = trades.filter(t => t.status === 'completed' && t.pnl !== undefined && t.preTradeEmotion);
  const map: Record<string, { totalR: number; count: number; wins: number }> = {};
  completed.forEach(t => {
    const e = t.preTradeEmotion;
    if (!map[e]) map[e] = { totalR: 0, count: 0, wins: 0 };
    map[e].totalR += t.pnlR || 0;
    map[e].count += 1;
    if (t.outcome === 'win') map[e].wins += 1;
  });
  return Object.entries(map).map(([emotion, d]) => ({
    emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    avgR: Math.round((d.totalR / d.count) * 100) / 100,
    winRate: Math.round((d.wins / d.count) * 100),
    count: d.count,
  })).sort((a, b) => b.avgR - a.avgR);
}

export function getDrawdownCurve(trades: Trade[]) {
  const sorted = [...trades].filter(t => t.status === 'completed' && t.pnl !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let peak = 0, equity = 0;
  return sorted.map((t, i) => {
    equity += t.pnl || 0;
    if (equity > peak) peak = equity;
    const dd = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
    return { name: `#${i + 1}`, drawdown: -Math.round(dd * 10) / 10, date: new Date(t.date).toLocaleDateString() };
  });
}

export function computeTradeQualityScore(trade: Partial<Trade>): number {
  let score = 0;
  // Preparation (20%)
  score += ((trade.planQuality || 5) / 10) * 20;
  // Entry Quality (20%)
  score += ((trade.entryQuality || 5) / 10) * 20;
  // Exit Quality (15%)
  score += ((trade.exitQuality || 5) / 10) * 15;
  // Risk (15%)
  const rr = trade.riskReward || 1;
  score += Math.min(rr / 3, 1) * 15;
  // Rules followed (15%)
  score += trade.rulesFollowed ? 15 : 0;
  // Psychology control (15%)
  const mentalScore = ((trade.mentalState || 5) / 10) * 15;
  score += mentalScore;
  return Math.round(Math.min(score, 100));
}

export function generateInsights(trades: Trade[]): string[] {
  const completed = trades.filter(t => t.status === 'completed' && t.pnl !== undefined);
  if (completed.length < 5) return ['برای نمایش بینش‌ها، حداقل ۵ معامله تکمیل‌شده ثبت کنید.'];
  const insights: string[] = [];

  const sessionMap: Record<string, string> = {
    london: 'لندن', ny: 'نیویورک', asian: 'آسیا', overlap: 'تداخل'
  };
  const sessionData = getSessionBreakdown(trades);
  const bestSession = [...sessionData].sort((a, b) => b.pnl - a.pnl)[0];
  if (bestSession) insights.push(`بهترین جلسه شما ${sessionMap[bestSession.session] || bestSession.session} با سود کل ${bestSession.pnl.toFixed(0)} است.`);

  const emotionMap: Record<string, string> = {
    calm: 'آرام', confident: 'با اطمینان', neutral: 'خنثی',
    anxious: 'نگران', fearful: 'ترسیده', excited: 'هیجان‌زده',
    frustrated: 'ناامید', impatient: 'بی‌صبر'
  };
  const emotionData = getEmotionPerformance(trades);
  const bestEmotion = emotionData[0];
  if (bestEmotion) insights.push(`معامله در حالت ${emotionMap[bestEmotion.emotion] || bestEmotion.emotion} بهترین میانگین R شما را می‌دهد: ${bestEmotion.avgR}R.`);

  const stratData = getStrategyBreakdown(trades);
  if (stratData.length > 1) insights.push(`«${stratData[0].strategy}» سودآورترین استراتژی شما است (${stratData[0].pnl.toFixed(0)}).`);

  const metrics = calculateMetrics(trades);
  if (metrics.avgRulesFollowed < 70) insights.push(`رعایت قوانین ${metrics.avgRulesFollowed.toFixed(0)}٪ است — بهبود این مورد عملکرد را به‌طور قابل توجهی افزایش می‌دهد.`);
  if (metrics.sharpeRatio > 1) insights.push(`بازده تعدیل‌شده بر اساس ریسک قوی است: نسبت شارپ ${metrics.sharpeRatio.toFixed(2)}.`);
  if (metrics.consecutiveLosses >= 3) insights.push(`تا ${metrics.consecutiveLosses} باخت متوالی داشته‌اید — یک قانون استراحت پس از ۲ باخت اعمال کنید.`);
  if (metrics.profitFactor >= 2) insights.push(`ضریب سود ${metrics.profitFactor.toFixed(2)} — استراتژی‌های سودآور شما را حفظ کنید.`);

  return insights;
}
