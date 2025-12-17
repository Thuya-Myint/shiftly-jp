import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingScreen } from './components/LoadingScreen';
import ShiftTracker from './pages/shift';

export default function App() {
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLaunchScreen(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showLaunchScreen) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/shifts" replace />} />
      <Route path="/shifts" element={<ShiftTracker />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">404 — Page Not Found</h1>
    </div>
  );
}