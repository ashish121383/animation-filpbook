import { type ReactNode, useMemo } from 'react';
import { FlipbookContext } from './FlipbookContext';
import { useFlipbookReducer } from './flipbookReducer';

interface FlipbookProviderProps {
  children: ReactNode;
}

export function FlipbookProvider({ children }: FlipbookProviderProps) {
  const [state, dispatch] = useFlipbookReducer();

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <FlipbookContext.Provider value={value}>{children}</FlipbookContext.Provider>;
}
