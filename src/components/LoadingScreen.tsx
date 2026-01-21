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

  const backgroundIcons = [
    { Icon: Zap, x: "5%", y: "5%", size: 40 },
    { Icon: Clock, x: "20%", y: "20%", size: 35 },
    { Icon: Coins, x: "35%", y: "35%", size: 45 },
    { Icon: Zap, x: "50%", y: "50%", size: 60 },
    { Icon: Clock, x: "70%", y: "70%", size: 25 },
    { Icon: Coins, x: "90%", y: "90%", size: 35 },
    { Icon: Zap, x: "95%", y: "5%", size: 40 },
    { Icon: Clock, x: "80%", y: "20%", size: 35 },
    { Icon: Coins, x: "65%", y: "35%", size: 45 },
    { Icon: Clock, x: "30%", y: "70%", size: 25 },
    { Icon: Coins, x: "10%", y: "90%", size: 35 },
  ];

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center relative overflow-hidden",
        PRIMARY_COLOR_CLASSES.bgGradient
      )}
    >
      {/* Background Icons (Static) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundIcons.map(({ Icon, x, y, size }, i) => (
          <div
            key={i}
            className="absolute text-white/20"
            style={{ left: x, top: y }}
          >
            <Icon size={size} />
          </div>
        ))}

        {/* Yen Symbols (Static) */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`yen-${i}`}
            className="absolute font-bold text-white/5"
            style={{
              left: `${(i * 29 + 10) % 100}%`,
              top: `${(i * 31 + 15) % 100}%`,
              fontSize: `${40 + (i * 5)}px`
            }}
          >
            ¥
          </div>
        ))}
      </div>

      <div className="text-center relative z-10 px-8">
        <div className="mb-10 flex justify-center">
          <div className="w-40 h-40 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl flex items-center justify-center shadow-2xl border border-white/20 overflow-hidden">
            <img
              src="/shomynLogo-7FEuR7Ac.png"
              alt="Shomyn Logo"
              className="w-28 h-28 object-contain"
            />
          </div>
        </div>

        <h1
          className="text-4xl tracking-[0.4rem] mb-4 text-white uppercase"
        >
          SHOMYN
        </h1>

        {/* <p className="text-white/80 text-xl font-bold uppercase tracking-[0.2em] mb-16">
          Track shifts • <span className="text-white">Save smarter</span>
        </p> */}

        {/* Progress Bar with simple CSS animation for performance */}
        {/* <div className="relative w-64 h-2 bg-white/10 rounded-full mx-auto overflow-hidden backdrop-blur-sm border border-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white animate-progress-fast"
            style={{ width: '40%' }}
          />
        </div>

        <style>{`
          @keyframes progress-fast {
            0% { left: -40%; }
            100% { left: 100%; }
          }
          .animate-progress-fast {
            position: absolute;
            animation: progress-fast 1.5s linear infinite;
          }
        `}</style> */}

        <div className="mt-8 text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
          INITIALIZING SYSTEM
        </div>
      </div>
    </div>
  );
}
