import { create } from 'zustand';
import { Trade } from '../db/database';

interface TradeState {
  selectedTrade: Trade | null;
  setSelectedTrade: (trade: Trade | null) => void;
  isTradeModalOpen: boolean;
  setTradeModalOpen: (open: boolean) => void;
}

export const useTradeStore = create<TradeState>((set) => ({
  selectedTrade: null,
  setSelectedTrade: (trade) => set({ selectedTrade: trade }),
  isTradeModalOpen: false,
  setTradeModalOpen: (open) => set({ isTradeModalOpen: open })
}));