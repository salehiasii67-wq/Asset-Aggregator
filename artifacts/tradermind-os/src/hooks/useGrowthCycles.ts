import { useState, useEffect } from 'react';
import { db, GrowthCycle } from '../db/database';

export function useGrowthCycles() {
  const [cycles, setCycles] = useState<GrowthCycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const allCycles = await db.growthCycles.orderBy('startDate').reverse().toArray();
        setCycles(allCycles);
      } catch (error) {
        console.error("Failed to fetch growth cycles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCycles();
  }, []);

  const addCycle = async (cycle: Omit<GrowthCycle, 'id'>) => {
    const id = await db.growthCycles.add(cycle as GrowthCycle);
    setCycles([{ ...cycle, id }, ...cycles]);
    return id;
  };

  return { cycles, loading, addCycle };
}