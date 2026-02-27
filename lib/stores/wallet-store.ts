import { create } from 'zustand';

interface WalletState {
  balance: number;
  isLoading: boolean;
  fetchBalance: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  isLoading: true,
  fetchBalance: async () => {
    try {
      const res = await fetch('/api/wallet/balance');
      if (res.ok) {
        const data = await res.json();
        set({ balance: data.balance, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
