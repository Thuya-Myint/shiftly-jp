import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { getPrimaryColorClasses, THEME_VARIANTS } from '@/constants/themes';
import { LOCAL_STORAGE_KEY } from '@/constants';
import { loginWithGoogle } from '@/services/login';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);

    // Get theme from localStorage
    const getStoredTheme = () => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                return {
                    theme: data.theme || 'light',
                    variantIndex: data.variantIndex || 3
                };
            }
        } catch (e) {
            // Ignore errors
        }
        return { theme: 'light', variantIndex: 3 };
    };

    const { theme, variantIndex } = getStoredTheme();
    const PRIMARY_COLOR_CLASSES = getPrimaryColorClasses(variantIndex, theme);
    const themeVariant = THEME_VARIANTS[variantIndex];
    const appClasses = theme === 'light' ? themeVariant.light : themeVariant.dark;

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            await loginWithGoogle();
        } catch (error) {
            console.error('Login failed:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("min-h-screen flex items-center justify-center", appClasses)}>
            <div className="backdrop-blur-sm bg-white/90 dark:bg-black/90 rounded-2xl p-8 shadow-xl max-w-md w-full mx-4">
                <div className="text-center mb-8">
                    <h1
                        className={cn("text-4xl font-bold mb-2", PRIMARY_COLOR_CLASSES.text)}
                        style={{ fontFamily: 'Fredoka, sans-serif' }}
                    >
                        Shomyn
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        Sign in to track your shifts
                    </p>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className={cn(
                        "w-full flex items-center justify-center gap-3 rounded-xl px-6 py-4 font-semibold transition-all duration-200 shadow-md",
                        "bg-white dark:bg-slate-700 border-2",
                        PRIMARY_COLOR_CLASSES.border,
                        "text-gray-700 dark:text-gray-200",
                        !isLoading && "hover:shadow-lg hover:bg-gray-50 dark:hover:bg-slate-600 hover:-translate-y-0.5",
                        isLoading && "opacity-70 cursor-not-allowed"
                    )}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    )}
                    <span>
                        {isLoading ? 'Signing in...' : 'Continue with Google'}
                    </span>
                </button>
            </div>
        </div>
    );
}

export default Login;
