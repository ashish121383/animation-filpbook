import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FlipbookProvider } from '@/context';
import { FlipbookViewer } from '@/components/FlipbookViewer';
import '@/styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FlipbookProvider>
      <FlipbookViewer />
    </FlipbookProvider>
  </StrictMode>
);
