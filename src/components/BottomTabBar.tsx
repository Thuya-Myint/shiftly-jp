import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = {
  to: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

export function BottomTabBar({
  theme,
  primaryColors
}: {
  theme: 'light' | 'dark';
  primaryColors: any;
}) {
  const location = useLocation();

  const tabs: Tab[] = [
    { to: '/dashboard', label: 'Home', Icon: Home },
    { to: '/shifts', label: 'Shift', Icon: CalendarDays },
    { to: '/settings', label: 'Setting', Icon: Settings }
  ];

  const isActive = (to: string) =>
    location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe pt-3" aria-label="Bottom navigation">
      <div className="mx-auto w-full max-w-4xl">
        <div
          className={cn(
            'relative grid grid-cols-3 gap-2 p-2 rounded-3xl border shadow-2xl backdrop-blur-2xl',
            theme === 'light'
              ? 'bg-white/70 border-gray-200/60'
              : 'bg-slate-900/60 border-white/10'
          )}
        >
          {tabs.map(({ to, label, Icon }) => {
            const active = isActive(to);

            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1',
                  'py-2 rounded-2xl',
                  'transition-all duration-200',
                  active
                    ? cn(primaryColors.bgGradient, 'text-white shadow-lg')
                    : theme === 'light'
                      ? 'hover:bg-gray-100 text-gray-600'
                      : 'hover:bg-white/5 text-gray-300'
                )}
              >
                <Icon
                  size={19}
                  className={cn(active ? 'text-white' : 'text-gray-500 dark:text-gray-300')}
                />
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-[0.18em]',
                    active ? 'text-white' : 'text-gray-500 dark:text-gray-300'
                  )}
                >
                  {label}
                </span>

                {active && (
                  <span
                    className={cn(
                      'absolute -top-1 h-1.5 w-10 rounded-full',
                      theme === 'light' ? 'bg-black/10' : 'bg-white/15'
                    )}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
