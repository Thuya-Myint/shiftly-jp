import React from 'react';
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
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={cn("min-h-screen flex flex-col items-center justify-center hw-accelerate transition-all duration-500 ease-in-out relative overflow-hidden", appClasses)}
        >
            {/* Animated wave background */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className={cn("absolute inset-0 opacity-10", PRIMARY_COLOR_CLASSES.bgGradient)}
                    animate={{
                        background: [
                            "radial-gradient(circle at 20% 50%, currentColor 0%, transparent 50%)",
                            "radial-gradient(circle at 80% 50%, currentColor 0%, transparent 50%)",
                            "radial-gradient(circle at 40% 50%, currentColor 0%, transparent 50%)"
                        ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Floating orbs */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={cn("absolute rounded-full blur-sm", PRIMARY_COLOR_CLASSES.bgLight)}
                        style={{
                            width: `${20 + i * 5}px`,
                            height: `${20 + i * 5}px`,
                            left: `${15 + i * 10}%`,
                            top: `${10 + (i % 4) * 20}%`
                        }}
                        animate={{
                            x: [0, 100, -50, 0],
                            y: [0, -80, 60, 0],
                            scale: [1, 1.2, 0.8, 1],
                            opacity: [0.1, 0.3, 0.1, 0.2]
                        }}
                        transition={{
                            duration: 6 + i * 0.8,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ scale: 0.3, opacity: 0, y: 100 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "backOut" }}
                className="text-center relative z-10 backdrop-blur-sm bg-white/5 dark:bg-black/5 rounded-3xl p-8 border border-white/10"
            >
                {/* Advanced Liquid Flow Loader */}
                <div className="relative w-40 h-40 mx-auto mb-10">
                    {/* Multiple glow layers */}
                    <motion.div
                        className="absolute -inset-8 rounded-full"
                        style={{
                            background: `radial-gradient(circle, ${spinnerColor}15 0%, transparent 80%)`,
                            filter: 'blur(20px)'
                        }}
                        animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.8, 0.3] 
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    <motion.div
                        className="absolute -inset-4 rounded-full"
                        style={{
                            background: `radial-gradient(circle, ${spinnerColor}25 0%, transparent 70%)`,
                            filter: 'blur(15px)'
                        }}
                        animate={{ 
                            scale: [1.2, 1, 1.2],
                            opacity: [0.4, 1, 0.4] 
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    />

                    {/* Main liquid container */}
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2" 
                         style={{ 
                             background: `linear-gradient(135deg, ${spinnerColor}10, ${spinnerColor}30)`,
                             borderColor: `${spinnerColor}40`,
                             boxShadow: `inset 0 0 30px ${spinnerColor}20, 0 0 40px ${spinnerColor}30`
                         }}>
                        
                        {/* Multiple flowing wave layers */}
                        <motion.div
                            className="absolute w-[200%] h-[200%] -left-[50%] -top-[50%]"
                            style={{ 
                                background: `conic-gradient(from 0deg, transparent, ${spinnerColor}60, transparent, ${spinnerColor}40, transparent)`,
                                borderRadius: "50%"
                            }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        />
                        
                        <motion.div
                            className="absolute w-[180%] h-[180%] -left-[40%] -top-[40%]"
                            style={{ 
                                background: `conic-gradient(from 180deg, transparent, ${spinnerColor}50, transparent, ${spinnerColor}70, transparent)`,
                                borderRadius: "50%"
                            }}
                            animate={{ rotate: -360 }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        />
                        
                        {/* Central flowing liquid */}
                        <motion.div
                            className="absolute inset-4 rounded-full"
                            style={{ 
                                background: `radial-gradient(circle at 30% 30%, ${spinnerColor}80, ${spinnerColor}40)`,
                                filter: 'blur(2px)'
                            }}
                            animate={{
                                scale: [1, 1.2, 0.9, 1],
                                opacity: [0.6, 1, 0.7, 0.6]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        
                        {/* Flowing particles */}
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full"
                                style={{
                                    width: `${3 + (i % 4)}px`,
                                    height: `${3 + (i % 4)}px`,
                                    background: `${spinnerColor}90`,
                                    filter: `blur(${0.5 + (i % 2)}px) drop-shadow(0 0 4px ${spinnerColor})`,
                                    left: `${20 + (i * 6) % 60}%`,
                                    top: `${15 + (i * 8) % 70}%`
                                }}
                                animate={{
                                    x: [0, 30, -20, 40, 0],
                                    y: [0, -25, 35, -15, 0],
                                    scale: [0.5, 1.5, 0.8, 1.2, 0.5],
                                    opacity: [0.3, 1, 0.5, 0.9, 0.3]
                                }}
                                transition={{
                                    duration: 5 + (i * 0.3),
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                        
                        {/* Surface ripples */}
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={`ripple-${i}`}
                                className="absolute border-2 rounded-full"
                                style={{
                                    borderColor: `${spinnerColor}30`,
                                    left: "50%",
                                    top: "50%",
                                    transform: "translate(-50%, -50%)"
                                }}
                                animate={{
                                    width: ["20px", "120px", "20px"],
                                    height: ["20px", "120px", "20px"],
                                    opacity: [0.8, 0.1, 0.8]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: i * 0.7,
                                    ease: "easeOut"
                                }}
                            />
                        ))}
                    </div>
                </div>

                <motion.h1
                    initial={{ y: 50, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: "backOut" }}
                    className={cn("text-5xl font-semibold mb-4 tracking-wide", PRIMARY_COLOR_CLASSES.text)}
                    style={{ fontFamily: 'Fredoka, sans-serif' }}
                >
                    <motion.span
                        animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className={cn("bg-clip-text text-transparent bg-gradient-to-r", PRIMARY_COLOR_CLASSES.bgGradient)}
                        style={{ backgroundSize: "200% 200%" }}
                    >
                        Shomyn
                    </motion.span>
                </motion.h1>

                <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                    className="text-gray-600 dark:text-gray-300 text-xl font-medium mb-2"
                >
                    <motion.span
                        animate={{
                            opacity: [0.6, 1, 0.6],
                            y: [0, -2, 0]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        Loading...
                    </motion.span>
                </motion.p>

                {/* Progress dots */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex justify-center gap-2 mt-6"
                >
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={cn("w-2 h-2 rounded-full", PRIMARY_COLOR_CLASSES.bgLight)}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}