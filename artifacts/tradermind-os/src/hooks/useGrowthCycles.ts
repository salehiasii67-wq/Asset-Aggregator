import { useState, useEffect, useCallback } from 'react';
import { db, GrowthCycle, CycleMission } from '../db/database';

export function useGrowthCycles() {
  const [cycles, setCycles] = useState<GrowthCycle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const all = await db.growthCycles.orderBy('startDate').reverse().toArray();
      setCycles(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addCycle = async (cycle: Omit<GrowthCycle, 'id'>) => {
    const id = await db.growthCycles.add(cycle as GrowthCycle);
    await fetch();
    return id;
  };

  const completeCycle = async (id: number) => {
    await db.growthCycles.update(id, { status: 'completed', endDate: new Date().toISOString() });
    await fetch();
  };

  const updateCycle = async (id: number, updates: Partial<GrowthCycle>) => {
    await db.growthCycles.update(id, updates);
    await fetch();
  };

  return { cycles, loading, addCycle, completeCycle, updateCycle, refetch: fetch };
}

export function useCycleMissions(cycleId?: number) {
  const [missions, setMissions] = useState<CycleMission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!cycleId) { setLoading(false); return; }
    try {
      const today = new Date().toISOString().split('T')[0];
      const all = await db.cycleMissions.where('cycleId').equals(cycleId).toArray();
      // Get today's missions, or create defaults if none exist for today
      const todayMissions = all.filter(m => m.date === today);
      if (todayMissions.length === 0 && all.length === 0) {
        // Seed default missions for today
        const defaults: Omit<CycleMission, 'id'>[] = [
          { cycleId, date: today, task: 'مرور ۳ معامله آخر', category: 'review', status: 'pending', createdAt: new Date().toISOString() },
          { cycleId, date: today, task: 'ثبت جلسه روانشناسی', category: 'psychology', status: 'pending', createdAt: new Date().toISOString() },
          { cycleId, date: today, task: 'برنامه‌ریزی جلسات فردا', category: 'analysis', status: 'pending', createdAt: new Date().toISOString() },
          { cycleId, date: today, task: 'بدون معامله بیش از حد (حداکثر ۳ معامله)', category: 'discipline', status: 'pending', createdAt: new Date().toISOString() },
        ];
        await db.cycleMissions.bulkAdd(defaults as CycleMission[]);
      }
      const refreshed = await db.cycleMissions.where('cycleId').equals(cycleId).toArray();
      setMissions(refreshed.filter(m => m.date === today));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleMission = async (id: number, current: 'pending' | 'completed' | 'failed') => {
    const next = current === 'completed' ? 'pending' : 'completed';
    await db.cycleMissions.update(id, { status: next });
    setMissions(prev => prev.map(m => m.id === id ? { ...m, status: next } : m));
  };

  const addMission = async (mission: Omit<CycleMission, 'id'>) => {
    const id = await db.cycleMissions.add(mission as CycleMission);
    await fetch();
    return id;
  };

  return { missions, loading, toggleMission, addMission, refetch: fetch };
}
