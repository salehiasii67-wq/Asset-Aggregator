import { useState, useEffect } from 'react';
import { db, Trade } from '../db/database';

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const allTrades = await db.trades.orderBy('date').reverse().toArray();
        setTrades(allTrades);
      } catch (error) {
        console.error("Failed to fetch trades:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, []);

  const addTrade = async (trade: Omit<Trade, 'id'>) => {
    const id = await db.trades.add(trade as Trade);
    setTrades([{ ...trade, id }, ...trades]);
    return id;
  };

  const updateTrade = async (id: number, updates: Partial<Trade>) => {
    await db.trades.update(id, updates);
    setTrades(trades.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTrade = async (id: number) => {
    await db.trades.delete(id);
    setTrades(trades.filter(t => t.id !== id));
  };

  return { trades, loading, addTrade, updateTrade, deleteTrade };
}