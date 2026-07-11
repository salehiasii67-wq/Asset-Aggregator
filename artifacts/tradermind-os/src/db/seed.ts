import { db } from './database';

export async function seedDatabase() {
  if (localStorage.getItem('tradermind_seeded') === 'true') {
    return;
  }

  const now = new Date();
  
  const sampleProfile = {
    name: 'Alex',
    accountSize: 100000,
    riskPerTradeDefault: 1,
    preferredCurrency: 'USD',
    level: 3,
    createdAt: now.toISOString()
  };

  const sampleTrades = [];
  const strategies = ['Breakout', 'Mean Reversion', 'Trend Following'];
  const symbols = ['EURUSD', 'GBPUSD', 'XAUUSD', 'US30'];
  const sessions = ['london', 'ny', 'asian', 'overlap'] as const;
  const emotions = ['calm', 'anxious', 'confident', 'neutral'];

  for (let i = 20; i > 0; i--) {
    const tradeDate = new Date(now);
    tradeDate.setDate(tradeDate.getDate() - i);
    
    const isWin = Math.random() > 0.4;
    const pnlMultiplier = isWin ? (Math.random() * 2 + 1) : -(Math.random() * 0.5 + 0.5);
    const pnl = Math.round(1000 * pnlMultiplier);
    const pnlR = Number(pnlMultiplier.toFixed(2));
    
    sampleTrades.push({
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      direction: Math.random() > 0.5 ? 'long' : 'short' as any,
      strategy: strategies[Math.floor(Math.random() * strategies.length)],
      sessionType: sessions[Math.floor(Math.random() * sessions.length)],
      date: tradeDate.toISOString(),
      status: 'completed' as any,
      
      preTradeEmotion: emotions[Math.floor(Math.random() * emotions.length)],
      mentalState: Math.floor(Math.random() * 4) + 6, // 6-9
      planQuality: Math.floor(Math.random() * 3) + 7, // 7-9
      setupNotes: 'Seeded sample trade setup note.',
      riskPercent: 1,
      riskAmount: 1000,
      
      entryPrice: 100 + Math.random() * 50,
      stopLoss: 99,
      takeProfit: 102,
      positionSize: 1,
      entryQuality: Math.floor(Math.random() * 4) + 6,
      exitQuality: Math.floor(Math.random() * 4) + 6,
      rulesFollowed: Math.random() > 0.2,
      
      pnl,
      pnlR,
      outcome: isWin ? 'win' : 'loss' as any,
      
      postEmotion: emotions[Math.floor(Math.random() * emotions.length)],
      executionScore: Math.floor(Math.random() * 4) + 6,
      lessonLearned: isWin ? 'Followed plan perfectly.' : 'Exited too early due to fear.',
      mistakes: isWin ? [] : ['impatience'],
      tags: ['sample'],
      
      createdAt: tradeDate.toISOString(),
      updatedAt: tradeDate.toISOString()
    });
  }

  const sampleGrowthCycle = {
    name: 'Discipline Month',
    startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    status: 'active' as any,
    goals: ['Stick to 1% risk', 'No revenge trading'],
    weaknesses: ['FOMO entries'],
    focusAreas: ['Patience', 'Risk Management'],
    targetWinRate: 50,
    targetRR: 2,
    createdAt: now.toISOString()
  };

  const samplePsychLogs = [];
  for (let i = 5; i > 0; i--) {
    const logDate = new Date(now);
    logDate.setDate(logDate.getDate() - i);
    samplePsychLogs.push({
      date: logDate.toISOString().split('T')[0],
      sessionType: sessions[Math.floor(Math.random() * sessions.length)],
      overallMood: Math.floor(Math.random() * 5) + 5,
      stressLevel: Math.floor(Math.random() * 5) + 3,
      confidenceLevel: Math.floor(Math.random() * 5) + 5,
      focusLevel: Math.floor(Math.random() * 4) + 6,
      notes: 'Feeling good about the session today.',
      triggers: ['Missing an entry'],
      strategies: ['Deep breathing'],
      createdAt: logDate.toISOString()
    });
  }

  await db.transaction('rw', db.traderProfile, db.trades, db.growthCycles, db.psychologyLogs, async () => {
    await db.traderProfile.add(sampleProfile);
    await db.trades.bulkAdd(sampleTrades);
    await db.growthCycles.add(sampleGrowthCycle);
    await db.psychologyLogs.bulkAdd(samplePsychLogs);
  });

  localStorage.setItem('tradermind_seeded', 'true');
}