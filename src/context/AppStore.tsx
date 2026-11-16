import React, { createContext, useContext, useEffect, useRef, useSyncExternalStore } from 'react';
import { MBStore } from './store';

const Ctx = createContext<MBStore | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<MBStore | null>(null);
  if (!ref.current) ref.current = new MBStore();
  const store = ref.current;
  useEffect(() => { store.start(); return () => store.stop(); }, [store]);
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

/** Returns the store and re-renders the caller on every state change. */
export function useStore(): MBStore {
  const store = useContext(Ctx);
  if (!store) throw new Error('useStore must be used inside AppStoreProvider');
  useSyncExternalStore(store.subscribe, store.getVersion);
  return store;
}
