import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        return _jsx(LoadingScreen, {});
    }
    return (_jsx(ThemeProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: isAuthenticated ? "/shifts" : "/login", replace: true }) }), _jsx(Route, { path: "/login", element: isAuthenticated ? _jsx(Navigate, { to: "/shifts", replace: true }) : _jsx(Login, {}) }), _jsx(Route, { path: "/shifts", element: isAuthenticated ? _jsx(ShiftTracker, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/settings", element: isAuthenticated ? _jsx(Settings, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) }));
}
function NotFound() {
    return (_jsx("div", { className: "flex h-screen items-center justify-center", children: _jsx("h1", { className: "text-2xl font-bold", children: "404 \u2014 Page Not Found" }) }));
}
