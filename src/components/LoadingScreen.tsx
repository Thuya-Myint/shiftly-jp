import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getPrimaryColorClasses, THEME_VARIANTS } from '@/constants/themes';
import { LOCAL_STORAGE_KEY } from '@/constants';

// Load Google Font
const loadGoogleFont = () => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    if (!document.querySelector(`link[href="${link.href}"]`)) {
        document.head.appendChild(link);
    }
};

loadGoogleFont();

export function LoadingScreen() {
    // Get theme from localStorage
    const getStoredTheme = () => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                return {
                    theme: data.theme || 'light',
                    variantIndex: data.variantIndex !== undefined ? data.variantIndex : 0
                };
            }
        } catch (e) {
            // Ignore errors
        }
        return { theme: 'light', variantIndex: 0 };
    };

    const { theme, variantIndex } = getStoredTheme();

    // Apply theme class immediately
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);
    const PRIMARY_COLOR_CLASSES = getPrimaryColorClasses(variantIndex, theme);
    const themeVariant = THEME_VARIANTS[variantIndex];

    const appClasses = theme === 'light' ? themeVariant.light : themeVariant.dark;

    // Get actual color values for spinner
    const getSpinnerColor = () => {
        const colorMap = {
            0: '#06b6d4', // cyan
            1: '#f97316', // orange  
            2: '#10b981', // emerald
            3: '#8b5cf6', // violet
            4: '#3b82f6', // blue
            5: '#ef4444', // red
            6: '#84cc16', // lime
            7: '#a855f7', // purple
        };
        return colorMap[variantIndex as keyof typeof colorMap] || '#8b5cf6';
    };

    const spinnerColor = getSpinnerColor();

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={cn("min-h-screen flex flex-col items-center justify-center relative overflow-hidden", appClasses)}
        >
            {/* Subtle background */}
            <div className="absolute inset-0 opacity-5">
                <div className={cn("absolute inset-0", PRIMARY_COLOR_CLASSES.bgGradient)} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center relative z-10 px-8"
            >
                {/* Clock with Yen icon */}
                <motion.div 
                    className="mb-8 flex justify-center"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className={cn("relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg", PRIMARY_COLOR_CLASSES.bgGradient)}>
                        <div className="absolute inset-2 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <span className={cn("text-4xl font-bold", PRIMARY_COLOR_CLASSES.text)}>¥</span>
                        </div>
                        <motion.div
                            className={cn("absolute w-1 h-8 rounded-full top-6 left-1/2 -translate-x-1/2 origin-bottom")}
                            style={{ background: spinnerColor }}
                            animate={{ rotate: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360] }}
                            transition={{ 
                                duration: 2.4, 
                                repeat: Infinity, 
                                ease: "linear",
                                times: [0, 0.083, 0.166, 0.25, 0.333, 0.416, 0.5, 0.583, 0.666, 0.75, 0.833, 0.916, 1]
                            }}
                        />
                    </div>
                </motion.div>



                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className={cn("text-5xl font-bold mb-3", PRIMARY_COLOR_CLASSES.text)}
                    style={{ fontFamily: 'Fredoka, sans-serif' }}
                >
                    Shomyn
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-gray-600 dark:text-gray-400 text-lg mb-8"
                >
                    Track shifts, save smarter
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-center gap-2"
                >
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={cn("w-2 h-2 rounded-full", PRIMARY_COLOR_CLASSES.bg)}
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.4, 1, 0.4]
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.15
                            }}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}