import Dexie, { Table } from 'dexie';

export interface Trade {
  id?: number;
  // Step 1: Trade Information
  symbol: string;
  market?: string;
  broker?: string;
  account?: string;
  direction: 'long' | 'short';
  date: string;
  entryTime?: string;
  exitTime?: string;
  sessionType: 'london' | 'ny' | 'asian' | 'overlap';
  status: 'planned' | 'active' | 'completed' | 'cancelled';

  // Price Data
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  leverage?: number;
  commission?: number;
  swap?: number;

  // Step 2: Market Context
  marketCondition?: 'trending' | 'ranging' | 'breakout' | 'reversal';
  volatility?: 'low' | 'medium' | 'high';
  newsCondition?: boolean;
  tradeRationale?: string;
  setupDescription?: string;
  entryConfirmation?: string;

  // Step 3: Strategy
  strategy: string;
  setupType?: string;
  playbookPattern?: string;
  checklistItems?: { rule: string; checked: boolean }[];

  // Step 4: Risk
  riskPercent: number;
  riskAmount: number;
  riskReward?: number;
  expectedR?: number;

  // Step 5: Psychology - Before
  preTradeEmotion: string;
  mentalState: number;
  planQuality: number;
  setupNotes: string;
  preConfidence?: number;
  preStress?: number;
  preFear?: number;
  prePatience?: number;
  preFocus?: number;
  preEnergy?: number;
  preMotivation?: number;
  preDiscipline?: number;

  // Psychology - During
  duringPressure?: number;
  duringFear?: number;
  duringGreed?: number;
  duringImpulse?: number;
  duringDoubt?: number;

  // Behavior
  followedPlan?: boolean;
  hesitated?: boolean;
  rushed?: boolean;
  brokRules?: boolean;
  emotionAffectedDecision?: boolean;

  // Step 6: Execution
  entryQuality: number;
  exitQuality: number;
  managementQuality?: number;
  rulesFollowed: boolean;
  patienceScore?: number;
  decisionQuality?: number;
  executionScore?: number;

  // Step 7: Review
  pnl?: number;
  pnlR?: number;
  outcome?: 'win' | 'loss' | 'breakeven';
  postEmotion?: string;
  whatWentRight?: string;
  whatWentWrong?: string;
  lessonLearned?: string;
  willRepeat?: string;
  willAvoid?: string;
  mistakes?: string[];
  tags?: string[];
  tradeQualityScore?: number;

  createdAt: string;
  updatedAt: string;
}

export interface GrowthCycle {
  id?: number;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  goals: string[];
  weaknesses: string[];
  focusAreas: string[];
  targetWinRate?: number;
  targetRR?: number;
  notes?: string;
  completionScore?: number;
  createdAt: string;
}

export interface CycleMission {
  id?: number;
  cycleId: number;
  date: string;
  task: string;
  category: 'review' | 'psychology' | 'analysis' | 'discipline' | 'custom';
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
  createdAt: string;
}

export interface PsychologyLog {
  id?: number;
  date: string;
  sessionType: string;
  overallMood: number;
  energyLevel: number;
  stressLevel: number;
  focusLevel: number;
  sleepQuality: number;
  motivation: number;
  confidenceLevel: number;
  tradingReadiness: number;
  notes: string;
  triggers: string[];
  copingStrategies: string[];
  createdAt: string;
}

export interface TraderProfile {
  id?: number;
  name: string;
  accountSize: number;
  riskPerTradeDefault: number;
  preferredCurrency: string;
  level: number;
  bio?: string;
  timezone?: string;
  createdAt: string;
}

export class TraderMindDatabase extends Dexie {
  trades!: Table<Trade>;
  growthCycles!: Table<GrowthCycle>;
  cycleMissions!: Table<CycleMission>;
  psychologyLogs!: Table<PsychologyLog>;
  traderProfile!: Table<TraderProfile>;

  constructor() {
    super('TraderMindDB');
    this.version(2).stores({
      trades: '++id, date, symbol, strategy, direction, status, sessionType, preTradeEmotion, outcome, marketCondition',
      growthCycles: '++id, startDate, endDate, status',
      cycleMissions: '++id, cycleId, date, status, category',
      psychologyLogs: '++id, date, sessionType',
      traderProfile: '++id',
    });
  }
}

export const db = new TraderMindDatabase();
