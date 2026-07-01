import { createContext, useContext } from 'react';
import type { FlipbookState, FlipbookAction } from '@/types';

export interface FlipbookContextValue {
  state: FlipbookState;
  dispatch: React.Dispatch<FlipbookAction>;
}

export const FlipbookContext = createContext<FlipbookContextValue | null>(null);

export function useFlipbookContext(): FlipbookContextValue {
  const context = useContext(FlipbookContext);
  if (!context) {
    throw new Error('useFlipbookContext must be used within FlipbookProvider');
  }
  return context;
}
