import Dexie, { Table } from 'dexie';

export interface Trade {
  id?: number;
  symbol: string;
  direction: 'long' | 'short';
  strategy: string;
  sessionType: 'london' | 'ny' | 'asian' | 'overlap';
  date: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  
  preTradeEmotion: string;
  mentalState: number;
  planQuality: number;
  setupNotes: string;
  riskPercent: number;
  riskAmount: number;
  
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  entryTime?: string;
  exitTime?: string;
  entryQuality: number;
  exitQuality: number;
  rulesFollowed: boolean;
  
  pnl?: number;
  pnlR?: number;
  outcome?: 'win' | 'loss' | 'breakeven';
  
  postEmotion?: string;
  executionScore?: number;
  lessonLearned?: string;
  mistakes?: string[];
  tags?: string[];
  
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

export interface PsychologyLog {
  id?: number;
  date: string;
  sessionType: string;
  overallMood: number;
  stressLevel: number;
  confidenceLevel: number;
  focusLevel: number;
  notes: string;
  triggers: string[];
  strategies: string[];
  createdAt: string;
}

export interface CycleMission {
  id?: number;
  cycleId: number;
  date: string;
  task: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface TraderProfile {
  id?: number;
  name: string;
  accountSize: number;
  riskPerTradeDefault: number;
  preferredCurrency: string;
  level: number;
  createdAt: string;
}

export class TraderMindDatabase extends Dexie {
  trades!: Table<Trade>;
  growthCycles!: Table<GrowthCycle>;
  psychologyLogs!: Table<PsychologyLog>;
  cycleMissions!: Table<CycleMission>;
  traderProfile!: Table<TraderProfile>;
  
  constructor() {
    super('TraderMindDB');
    this.version(1).stores({
      trades: '++id, date, symbol, strategy, direction, status, sessionType, preTradeEmotion, outcome',
      growthCycles: '++id, startDate, endDate, status',
      psychologyLogs: '++id, date, sessionType',
      cycleMissions: '++id, cycleId, date, status',
      traderProfile: '++id'
    });
  }
}

export const db = new TraderMindDatabase();
