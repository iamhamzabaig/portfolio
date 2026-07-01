import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../components/ui/ErrorBoundary.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { Navbar } from '../components/layout/Navbar.jsx';
import { BottomTabBar } from '../components/layout/BottomTabBar.jsx';
import { PageTransition } from '../components/layout/PageTransition.jsx';

export function PublicLayout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-24 md:pb-0">
        {/* Keyed by path so a crash on one page clears when the user navigates. */}
        <ErrorBoundary key={location.pathname}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </ErrorBoundary>
      </main>
      <Footer />
      <BottomTabBar />
    </div>
  );
}
