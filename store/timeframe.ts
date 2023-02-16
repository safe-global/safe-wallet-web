import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TimeframeStore = {
  timeframe: number;
  setTimeframe: (timeframe: number) => void;
};

export const useTimeframeStore = create<TimeframeStore>()(
  persist(
    (set) => ({
      timeframe: 3,
      setTimeframe: (newTimeframe: number) => set(() => ({ timeframe: newTimeframe })),
    }),
    {
      name: 'llamapay-timeframe', // unique name
    }
  )
);
