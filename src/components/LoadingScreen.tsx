import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Coins, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPrimaryColorClasses, THEME_VARIANTS } from '@/constants/themes';
import { STORAGE_KEYS } from '@/constants';
import { getItemFromLocalStorage } from '@/utils/localStorage';

export function LoadingScreen() {
  // Get theme from localStorage
  const getStoredTheme = () => {
    const data = getItemFromLocalStorage(STORAGE_KEYS.SHIFTS);
    if (data) {
      return {
        theme: data.theme || 'light',
        variantIndex: data.variantIndex !== undefined ? data.variantIndex : 0
      };
    }
    return { theme: 'light', variantIndex: 0 };
  };

  const { theme, variantIndex } = getStoredTheme();

  // Apply theme class immediately before render
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
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

  const backgroundIcons = [
    { Icon: Zap, x: "10%", y: "15%", size: 40 },
    { Icon: Clock, x: "85%", y: "20%", size: 35 },
    { Icon: Coins, x: "15%", y: "75%", size: 45 },
    { Icon: Zap, x: "80%", y: "80%", size: 30 },
    { Icon: Clock, x: "50%", y: "10%", size: 25 },
    { Icon: Coins, x: "90%", y: "50%", size: 35 },
  ];

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center relative overflow-hidden",
        PRIMARY_COLOR_CLASSES.bgGradient
      )}
    >
      {/* Floating Background Icons (Static Position, Floating Animation) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundIcons.map(({ Icon, x, y, size }, i) => (
          <motion.div
            key={i}
            className="absolute text-white/10"
            style={{ left: x, top: y }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Icon size={size} />
          </motion.div>
        ))}

        {/* Floating Yen Symbols */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`yen-${i}`}
            className="absolute font-black text-white/10"
            style={{
              left: `${(i * 29 + 10) % 100}%`,
              top: `${(i * 31 + 15) % 100}%`,
              fontSize: `${40 + (i * 5)}px`
            }}
            animate={{
              y: [0, 15, 0],
              rotate: [0, -15, 15, 0],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ¥
          </motion.div>
        ))}
      </div>

      <div className="text-center relative z-10 px-8">
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/30">
            <span className="text-7xl font-black text-white drop-shadow-lg">¥</span>
          </div>
        </div>

        <h1
          className="text-6xl font-black tracking-tighter mb-2 text-white drop-shadow-md"
          style={{ fontFamily: 'Fredoka, sans-serif' }}
        >
          Shomyn
        </h1>

        <p className="text-white/90 text-xl font-medium mb-12 drop-shadow-sm">
          Track shifts, <span className="font-bold">save smarter</span>
        </p>

        {/* Simple Progress Bar */}
        <div className="relative w-48 h-1.5 bg-white/20 rounded-full mx-auto overflow-hidden backdrop-blur-sm">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-white"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-white/60">
          Loading...
        </div>
      </div>
    </div>
  );
}
