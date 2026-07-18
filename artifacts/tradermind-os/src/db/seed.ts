import { db } from './database';
import { computeTradeQualityScore } from '../lib/analytics';

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
    bio: 'Forex and indices trader focusing on London session.',
    timezone: 'Europe/London',
    createdAt: now.toISOString()
  };

  const strategies = ['Breakout', 'Mean Reversion', 'Trend Following'];
  const symbols = ['EURUSD', 'GBPUSD', 'XAUUSD', 'US30'];
  const sessions = ['london', 'ny', 'asian', 'overlap'] as const;
  const preEmotions = ['calm', 'anxious', 'confident', 'neutral', 'excited', 'fearful'];
  const marketConditions = ['trending', 'ranging', 'breakout', 'reversal'] as const;

  const sampleTrades = [];
  for (let i = 30; i > 0; i--) {
    const tradeDate = new Date(now);
    tradeDate.setDate(tradeDate.getDate() - i);
    
    const isWin = Math.random() > 0.40;
    const pnlMultiplier = isWin ? (Math.random() * 2.5 + 0.5) : -(Math.random() * 0.8 + 0.2);
    const pnl = Math.round(1000 * pnlMultiplier);
    const pnlR = Number(pnlMultiplier.toFixed(2));
    const session = sessions[Math.floor(Math.random() * sessions.length)];
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    const emotion = preEmotions[Math.floor(Math.random() * preEmotions.length)];
    const entryQuality = Math.floor(Math.random() * 4) + 5;
    const exitQuality = Math.floor(Math.random() * 4) + 5;
    const mentalState = Math.floor(Math.random() * 4) + 5;
    const planQuality = Math.floor(Math.random() * 3) + 6;
    const rulesFollowed = Math.random() > 0.25;
    const direction = Math.random() > 0.5 ? 'long' : 'short' as any;

    const trade = {
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      direction,
      strategy,
      sessionType: session,
      date: tradeDate.toISOString(),
      status: 'completed' as any,
      
      entryPrice: parseFloat((1.1 + Math.random() * 0.2).toFixed(5)),
      stopLoss: parseFloat((1.09 + Math.random() * 0.1).toFixed(5)),
      takeProfit: parseFloat((1.12 + Math.random() * 0.2).toFixed(5)),
      positionSize: parseFloat((Math.random() + 0.5).toFixed(2)),
      
      marketCondition: marketConditions[Math.floor(Math.random() * marketConditions.length)],
      volatility: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      tradeRationale: 'Price broke key level with volume confirmation. Clean setup aligned with H4 structure.',
      
      riskPercent: 1,
      riskAmount: 1000,
      riskReward: 2 + Math.random(),
      expectedR: 2,

      preTradeEmotion: emotion,
      mentalState,
      planQuality,
      setupNotes: 'Checklist complete. Entry at key level with confirmation.',
      preConfidence: Math.floor(Math.random() * 4) + 6,
      preStress: Math.floor(Math.random() * 5) + 2,
      preFocus: Math.floor(Math.random() * 4) + 6,
      preEnergy: Math.floor(Math.random() * 4) + 6,
      preMotivation: Math.floor(Math.random() * 4) + 6,
      preDiscipline: Math.floor(Math.random() * 4) + 5,
      preFear: Math.floor(Math.random() * 4) + 1,
      prePatience: Math.floor(Math.random() * 4) + 5,
      
      followedPlan: rulesFollowed,
      hesitated: Math.random() > 0.7,
      rushed: Math.random() > 0.8,
      brokRules: !rulesFollowed,
      emotionAffectedDecision: Math.random() > 0.7,

      entryQuality,
      exitQuality,
      managementQuality: Math.floor(Math.random() * 4) + 5,
      rulesFollowed,
      patienceScore: Math.floor(Math.random() * 4) + 5,
      decisionQuality: Math.floor(Math.random() * 4) + 5,

      pnl,
      pnlR,
      outcome: isWin ? 'win' : 'loss' as any,
      postEmotion: isWin ? 'satisfied' : 'disappointed',
      whatWentRight: isWin ? 'Entry timing was precise, followed the plan without deviation.' : 'Risk was managed properly.',
      whatWentWrong: isWin ? null : 'Entered slightly late, price had already extended.',
      lessonLearned: isWin ? 'Patience pays off. Wait for confirmation.' : 'Do not chase price. Wait for pullback.',
      mistakes: rulesFollowed ? [] : ['impatience', 'early_entry'],
      tags: ['sample'],

      createdAt: tradeDate.toISOString(),
      updatedAt: tradeDate.toISOString()
    };

    (trade as any).tradeQualityScore = computeTradeQualityScore(trade as any);
    sampleTrades.push(trade);
  }

  const sampleGrowthCycle = {
    name: 'Discipline Month',
    startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    status: 'active' as any,
    goals: ['Stick to 1% risk per trade', 'No revenge trading after losses', 'Complete daily review every session'],
    weaknesses: ['FOMO entries', 'Moving stop loss under pressure'],
    focusAreas: ['Patience', 'Risk Management', 'Post-Session Review'],
    targetWinRate: 50,
    targetRR: 2,
    notes: 'Focus on process quality over P&L this month.',
    createdAt: now.toISOString()
  };

  const samplePsychLogs = [];
  for (let i = 14; i > 0; i--) {
    const logDate = new Date(now);
    logDate.setDate(logDate.getDate() - i);
    samplePsychLogs.push({
      date: logDate.toISOString().split('T')[0],
      sessionType: sessions[Math.floor(Math.random() * sessions.length)],
      overallMood: Math.floor(Math.random() * 4) + 5,
      energyLevel: Math.floor(Math.random() * 4) + 5,
      stressLevel: Math.floor(Math.random() * 5) + 2,
      focusLevel: Math.floor(Math.random() * 4) + 5,
      sleepQuality: Math.floor(Math.random() * 4) + 5,
      motivation: Math.floor(Math.random() * 4) + 6,
      confidenceLevel: Math.floor(Math.random() * 4) + 5,
      tradingReadiness: Math.floor(Math.random() * 4) + 5,
      notes: 'Feeling focused and prepared for the session.',
      triggers: Math.random() > 0.5 ? ['Missing an entry', 'News event'] : [],
      copingStrategies: ['Deep breathing', 'Stick to checklist'],
      createdAt: logDate.toISOString()
    });
  }

  await db.transaction('rw', db.traderProfile, db.trades, db.growthCycles, db.psychologyLogs, async () => {
    await db.traderProfile.add(sampleProfile);
    await db.trades.bulkAdd(sampleTrades as any);
    await db.growthCycles.add(sampleGrowthCycle);
    await db.psychologyLogs.bulkAdd(samplePsychLogs);
  });

  localStorage.setItem('tradermind_seeded', 'true');
}
