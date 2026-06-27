import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import App from './App';
import './index.css';

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000,
    },
  },
});

const dndBackend = isTouchDevice ? TouchBackend : HTML5Backend;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={dndBackend}>
        <App />
      </DndProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
