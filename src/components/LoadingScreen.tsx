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
                {/* Vibrant Fluid Loader */}
                <div className="relative w-36 h-36 mx-auto mb-10">
                    {/* Outer glow reflection */}
                    <motion.div
                        className="absolute -inset-8 rounded-full"
                        style={{
                            background: `radial-gradient(circle, ${spinnerColor}30 0%, ${spinnerColor}10 40%, transparent 70%)`,
                            filter: 'blur(30px)'
                        }}
                        animate={{ 
                            scale: [1, 1.4, 1],
                            opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    {/* Main vibrant fluid blob */}
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(135deg, ${spinnerColor}, ${spinnerColor}CC, ${spinnerColor}80)`,
                            filter: `blur(3px) drop-shadow(0 0 30px ${spinnerColor}) drop-shadow(0 0 60px ${spinnerColor}80)`,
                            boxShadow: `inset 0 0 40px rgba(255,255,255,0.3)`
                        }}
                        animate={{
                            borderRadius: [
                                "73% 27% 83% 17% / 72% 89% 11% 28%",
                                "47% 53% 21% 79% / 82% 17% 83% 18%", 
                                "36% 64% 47% 53% / 68% 46% 54% 32%",
                                "91% 9% 26% 74% / 84% 25% 75% 16%",
                                "73% 27% 83% 17% / 72% 89% 11% 28%"
                            ],
                            scale: [1, 1.08, 0.92, 1.03, 1]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    {/* Reflective highlight */}
                    <motion.div
                        className="absolute inset-4"
                        style={{
                            background: `linear-gradient(45deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2), transparent)`,
                            filter: 'blur(8px)'
                        }}
                        animate={{
                            borderRadius: [
                                "89% 11% 76% 24% / 23% 67% 33% 77%",
                                "34% 66% 19% 81% / 71% 29% 71% 29%",
                                "67% 33% 54% 46% / 89% 11% 89% 11%",
                                "12% 88% 43% 57% / 56% 78% 22% 44%",
                                "89% 11% 76% 24% / 23% 67% 33% 77%"
                            ],
                            opacity: [0.7, 1, 0.4, 0.8, 0.7]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    />
                    
                    {/* Inner vibrant core */}
                    <motion.div
                        className="absolute inset-8"
                        style={{
                            background: `radial-gradient(circle at 30% 30%, ${spinnerColor}, ${spinnerColor}AA)`,
                            filter: `blur(1px) drop-shadow(0 0 15px ${spinnerColor})`
                        }}
                        animate={{
                            borderRadius: [
                                "85% 15% 92% 8% / 13% 87% 13% 87%",
                                "23% 77% 45% 55% / 91% 9% 91% 9%",
                                "66% 34% 78% 22% / 44% 56% 44% 56%",
                                "41% 59% 17% 83% / 73% 27% 73% 27%",
                                "85% 15% 92% 8% / 13% 87% 13% 87%"
                            ],
                            scale: [1, 1.3, 0.7, 1.1, 1]
                        }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
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