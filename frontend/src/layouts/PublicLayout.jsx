import { AnimatePresence } from 'motion/react';
import { Outlet, useLocation } from 'react-router-dom';
import { CommandPaletteProvider } from '../components/ui/CommandPalette.jsx';
import { ErrorBoundary } from '../components/ui/ErrorBoundary.jsx';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { BottomTabBar } from '../components/layout/BottomTabBar.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { Navbar } from '../components/layout/Navbar.jsx';
import { useNavDirection } from '../hooks/useNavDirection.js';

export function PublicLayout() {
  const location = useLocation();
  const direction = useNavDirection();
  return (
    <CommandPaletteProvider>
    <div className="flex min-h-[100dvh] flex-col overflow-x-hidden">
      {/* Skip link — first tab stop, hidden until focused, lands keyboard users
          past the nav and straight on the page content. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-body-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      {/* Bottom padding on mobile clears the fixed tab bar (plus the home
          indicator); removed at md where the bar is hidden. */}
      <main
        id="main"
        className="flex-1 pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0"
      >
        {/* Keyed by path: AnimatePresence swaps pages on route change, and the
            fresh PageTransition remounts ErrorBoundary so a crash on one page
            clears when the user navigates. The motion element is the direct
            keyed child so popLayout can pop the outgoing page cleanly. */}
        <AnimatePresence mode="popLayout" initial={false}>
          <PageTransition key={location.pathname} direction={direction}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <BottomTabBar />
    </div>
    </CommandPaletteProvider>
  );
}
