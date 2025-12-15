import { Routes, Route, Navigate } from 'react-router-dom';
import ShiftTracker from './pages/shift';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Routes>
        <Route path="/" element={<Navigate to="/shifts" replace />} />
        <Route path="/shifts" element={<ShiftTracker />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">404 — Page Not Found</h1>
    </div>
  );
}