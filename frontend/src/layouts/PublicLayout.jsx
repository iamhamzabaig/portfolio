import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CommandPaletteProvider } from '../components/ui/CommandPalette.jsx';
import { ErrorBoundary } from '../components/ui/ErrorBoundary.jsx';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { BottomTabBar } from '../components/layout/BottomTabBar.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { Navbar } from '../components/layout/Navbar.jsx';
import { Explorer } from '../components/ide/Explorer.jsx';
import { EditorTabs } from '../components/ide/EditorTabs.jsx';

// The public site is framed as a code editor: title bar, file explorer,
// open-file tabs, the page as the editor pane, and a status bar. The window
// still scrolls, so GSAP/motion scroll scenes keep working.
export function PublicLayout() {
  const location = useLocation();
  const [explorerOpen, setExplorerOpen] = useState(false);
  return (
    <CommandPaletteProvider>
    <div className="world flex min-h-[100dvh] flex-col overflow-x-clip pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-7">
      {/* Skip link — first tab stop, hidden until focused. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-accent focus:px-4 focus:py-2 focus:text-body-sm focus:font-medium focus:text-on-accent"
      >
        Skip to content
      </a>
      <Navbar explorerOpen={explorerOpen} onToggleExplorer={() => setExplorerOpen((o) => !o)} />
      <div className="flex flex-1">
        <Explorer open={explorerOpen} onNavigate={() => setExplorerOpen(false)} />
        {explorerOpen && (
          <button
            type="button"
            aria-label="Close file explorer"
            onClick={() => setExplorerOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <EditorTabs />
          <main id="main" className="flex-1">
            {/* Route-local GSAP contexts clean up on navigation. */}
            <PageTransition key={location.pathname}>
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </PageTransition>
          </main>
        </div>
      </div>
      <Footer />
      <BottomTabBar />
    </div>
    </CommandPaletteProvider>
  );
}
