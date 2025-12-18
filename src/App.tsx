import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingScreen } from './components/LoadingScreen';
import ShiftTracker from './pages/shift';
import Login from './pages/Login';
import Settings from './pages/Settings';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';


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
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/shifts" : "/login"} replace />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/shifts" replace /> : <Login />} />
        <Route path="/shifts" element={isAuthenticated ? <ShiftTracker /> : <Navigate to="/login" replace />} />
        <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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