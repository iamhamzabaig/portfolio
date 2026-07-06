import { ToastProvider } from '../components/ui/Toast.jsx';
import { AppRoutes } from './router.jsx';

export default function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}
