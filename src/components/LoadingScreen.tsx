import { cn } from '@/lib/utils';
import { getPrimaryColorClasses } from '@/constants/themes';
import { STORAGE_KEYS } from '@/constants';
import { getItemFromLocalStorage } from '@/utils/localStorage';

function SkeletonBlock({
  className
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl',
        'bg-black/5 dark:bg-white/10',
        'border border-black/10 dark:border-white/10',
        'animate-pulse',
        className
      )}
    />
  );
}

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

  return (
    <div
      className={cn(
        'min-h-screen w-full relative overflow-hidden',
        theme === 'dark' ? 'bg-[#0b1220]' : 'bg-white'
      )}
    >
      <div className="relative z-10 mx-auto w-full max-w-md px-4 py-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center overflow-hidden">
            <img
              src="/shomynLogo-7FEuR7Ac.png"
              alt="Shomyn Logo"
              className="h-10 w-10 object-contain"
            />
          </div>
        </div>

        {/* Header skeleton */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-2xl" />
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-24 rounded-md" />
              <SkeletonBlock className="h-3 w-16 rounded-md opacity-70" />
            </div>
          </div>
          <SkeletonBlock className="h-8 w-8 rounded-full" />
        </div>

        {/* Month filter / controls skeleton */}
        <div className="mt-6 flex items-center gap-3">
          <SkeletonBlock className="h-9 w-24 rounded-full" />
          <SkeletonBlock className="h-9 w-32 rounded-full" />
          <SkeletonBlock className="h-9 flex-1 rounded-full" />
        </div>

        {/* Content list skeleton */}
        <div className="mt-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 p-4 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <SkeletonBlock className="h-4 w-40 rounded-md" />
                  <div className="flex gap-2">
                    <SkeletonBlock className="h-3 w-20 rounded-md opacity-80" />
                    <SkeletonBlock className="h-3 w-16 rounded-md opacity-60" />
                  </div>
                </div>
                <SkeletonBlock className="h-9 w-9 rounded-xl" />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <SkeletonBlock className="h-3 w-28 rounded-md opacity-60" />
                <SkeletonBlock className="h-6 w-20 rounded-full opacity-80" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">
          LOADING YOUR SHIFTS
        </div>
      </div>
    </div>
  );
}
