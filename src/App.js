import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import ShiftTracker from './pages/shift';
export default function App() {
    return (_jsx("div", { className: "min-h-screen bg-slate-900 text-white", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/shifts", replace: true }) }), _jsx(Route, { path: "/shifts", element: _jsx(ShiftTracker, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) }));
}
function NotFound() {
    return (_jsx("div", { className: "flex h-screen items-center justify-center", children: _jsx("h1", { className: "text-2xl font-bold", children: "404 \u2014 Page Not Found" }) }));
}
