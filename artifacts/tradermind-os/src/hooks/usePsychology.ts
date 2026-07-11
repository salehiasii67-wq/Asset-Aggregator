import { useState, useEffect } from 'react';
import { db, PsychologyLog } from '../db/database';

export function usePsychology() {
  const [logs, setLogs] = useState<PsychologyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const allLogs = await db.psychologyLogs.orderBy('date').reverse().toArray();
        setLogs(allLogs);
      } catch (error) {
        console.error("Failed to fetch psychology logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const addLog = async (log: Omit<PsychologyLog, 'id'>) => {
    const id = await db.psychologyLogs.add(log as PsychologyLog);
    setLogs([{ ...log, id }, ...logs]);
    return id;
  };

  return { logs, loading, addLog };
}