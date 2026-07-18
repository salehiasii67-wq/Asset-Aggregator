import { useState, useEffect, useCallback } from 'react';
import { db, PsychologyLog } from '../db/database';

export function usePsychology() {
  const [logs, setLogs] = useState<PsychologyLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const all = await db.psychologyLogs.orderBy('date').reverse().toArray();
      setLogs(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addLog = async (log: Omit<PsychologyLog, 'id'>) => {
    const id = await db.psychologyLogs.add(log as PsychologyLog);
    await fetch();
    return id;
  };

  const deleteLog = async (id: number) => {
    await db.psychologyLogs.delete(id);
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  return { logs, loading, addLog, deleteLog, refetch: fetch };
}
