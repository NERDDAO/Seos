import create from "zustand";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type TGlobalState = {
  nativeCurrencyPrice: number;
  setupInfo: {
    pid: string | null;
    startingBlock: string | null;
  };
  setSetupInfo: (newSetupnfo: { pid: string; startingBlock: string }) => void;
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
};

export const useGlobalState = create<TGlobalState>(set => ({
  setupInfo: {
    pid: null,
    startingBlock: null,
  },
  setSetupInfo: (newSetupId: { pid: string; startingBlock: string }): void => set(() => ({ setupInfo: newSetupId })),
  nativeCurrencyPrice: 0,
  setNativeCurrencyPrice: (newValue: number): void => set(() => ({ nativeCurrencyPrice: newValue })),
}));
