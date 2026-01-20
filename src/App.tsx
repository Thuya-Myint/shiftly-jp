import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingScreen } from './components/LoadingScreen';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy load pages for better initial load performance
const ShiftTracker = lazy(() => import('./pages/shift'));
const Login = lazy(() => import('./pages/Login'));
const Settings = lazy(() => import('./pages/Settings'));

export default function App() {
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLaunchScreen(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showLaunchScreen || loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? "/shifts" : "/login"} replace />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/shifts" replace /> : <Login />} />
          <Route path="/shifts" element={isAuthenticated ? <ShiftTracker /> : <Navigate to="/login" replace />} />
          <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">404 — Page Not Found</h1>
    </div>
  );
}
