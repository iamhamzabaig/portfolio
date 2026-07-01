import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { MotionConfig } from 'motion/react';
import { BrowserRouter, useNavigate, useHref } from 'react-router-dom';
import App from './app/App.jsx';
import { createQueryClient } from './app/queryClient.js';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './styles/index.css';

const queryClient = createQueryClient();

function HeroProviders({ children }) {
  const navigate = useNavigate();
  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ToastProvider placement="top-center" />
      {children}
    </HeroUIProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <MotionConfig reducedMotion="user">
              <HeroProviders>
                <App />
              </HeroProviders>
            </MotionConfig>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
