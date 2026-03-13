import { useEffect, useMemo, useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ChartStyle, useTheme } from '@/contexts/ThemeContext';
import { getPrimaryColorClasses, THEME_VARIANTS } from '@/constants/themes';
import { fetchUserShifts } from '@/services/shift';
import { Header } from '@/components/Header';
import { GlobalStyles } from '@/components/GlobalStyles';
import { BottomTabBar } from '@/components/BottomTabBar';
import { ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts';
import { yen } from '@/constants';
import { calculateHours } from '@/utils/time';

type MonthSummary = {
  monthKey: string; // yyyy-MM
  totalPay: number;
  totalHours: number;
  shiftCount: number;
};

function summarizeMonth(shifts: { shift_date: string; start_time: string; end_time: string; wage: number }[]): Omit<MonthSummary, 'monthKey'> {
  const total = shifts.reduce(
    (acc, s) => {
      const hours = calculateHours(s.start_time, s.end_time);
      const pay = Math.round(hours * s.wage);
      return {
        totalPay: acc.totalPay + pay,
        totalHours: acc.totalHours + hours,
        shiftCount: acc.shiftCount + 1
      };
    },
    { totalPay: 0, totalHours: 0, shiftCount: 0 }
  );

  return total;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { theme, variantIndex, lang, chartRange, chartStyle } = useTheme();
  const [rangeMode, setRangeMode] = useState<'weekly' | 'monthly'>('monthly');
  const primaryColors = useMemo(() => getPrimaryColorClasses(variantIndex, theme), [variantIndex, theme]);
  const themeVariant = THEME_VARIANTS[variantIndex];
  const appClasses = theme === 'light' ? themeVariant.light : themeVariant.dark;

  const [loading, setLoading] = useState(true);
  const [thisMonth, setThisMonth] = useState<MonthSummary | null>(null);
  const [lastMonth, setLastMonth] = useState<MonthSummary | null>(null);
  const [weeklySeries, setWeeklySeries] = useState<{ label: string; pay: number }[]>([]);
  const [monthlySeries, setMonthlySeries] = useState<{ label: string; pay: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const now = new Date();
        const currentStart = format(startOfMonth(now), 'yyyy-MM-dd');
        const currentEnd = format(endOfMonth(now), 'yyyy-MM-dd');

        const prev = subMonths(now, 1);
        const prevStart = format(startOfMonth(prev), 'yyyy-MM-dd');
        const prevEnd = format(endOfMonth(prev), 'yyyy-MM-dd');

        const [currentShifts, prevShifts] = await Promise.all([
          fetchUserShifts(user.id, currentStart, currentEnd),
          fetchUserShifts(user.id, prevStart, prevEnd)
        ]);

        const currentSummary = summarizeMonth(currentShifts);
        const prevSummary = summarizeMonth(prevShifts);

        // Weekly totals for last 6 weeks (Mon-Sun), incl current week
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const firstWeek = subWeeks(weekStart, 5);

        const weeksStart = format(firstWeek, 'yyyy-MM-dd');
        const weeksEnd = format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const lastSixWeeksShifts = await fetchUserShifts(user.id, weeksStart, weeksEnd);

        const weekBuckets = new Map<string, number>();
        for (let i = 0; i < 6; i++) {
          const ws = addWeeks(firstWeek, i);
          const label = format(ws, 'MM/dd');
          weekBuckets.set(label, 0);
        }

        for (const s of lastSixWeeksShifts) {
          const d = new Date(s.shift_date + 'T00:00:00');
          const ws = startOfWeek(d, { weekStartsOn: 1 });
          const label = format(ws, 'MM/dd');
          if (!weekBuckets.has(label)) continue;
          const hours = calculateHours(s.start_time, s.end_time);
          const pay = Math.round(hours * s.wage);
          weekBuckets.set(label, (weekBuckets.get(label) ?? 0) + pay);
        }

        const weekly = Array.from(weekBuckets.entries()).map(([label, pay]) => ({ label, pay }));
        setWeeklySeries(weekly);

        // Monthly totals for last 6 months
        const monthMap = new Map<string, number>();
        for (let i = 5; i >= 0; i--) {
          const d = subMonths(now, i);
          const key = format(d, 'yyyy-MM');
          monthMap.set(key, 0);
        }

        // Fetch shifts for the last 6 months range in one call (start = first day 5 months ago, end = end of current month)
        const monthsStart = format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd');
        const monthsEnd = currentEnd;
        const lastSixMonthsShifts = await fetchUserShifts(user.id, monthsStart, monthsEnd);

        for (const s of lastSixMonthsShifts) {
          const key = s.shift_date.slice(0, 7);
          if (!monthMap.has(key)) continue;
          const hours = calculateHours(s.start_time, s.end_time);
          const pay = Math.round(hours * s.wage);
          monthMap.set(key, (monthMap.get(key) ?? 0) + pay);
        }

        const monthly = Array.from(monthMap.entries()).map(([label, pay]) => ({ label, pay }));
        setMonthlySeries(monthly);

        setThisMonth({
          monthKey: format(now, 'yyyy-MM'),
          ...currentSummary
        });

        setLastMonth({
          monthKey: format(prev, 'yyyy-MM'),
          ...prevSummary
        });
      } catch (e) {
        console.error('Failed to load dashboard:', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const deltaPay = (thisMonth?.totalPay ?? 0) - (lastMonth?.totalPay ?? 0);
  const deltaHours = (thisMonth?.totalHours ?? 0) - (lastMonth?.totalHours ?? 0);

  const deltaPayLabel =
    deltaPay === 0
      ? (lang === 'en' ? 'No change' : '変化なし')
      : deltaPay > 0
        ? (lang === 'en' ? 'Up' : '増加')
        : (lang === 'en' ? 'Down' : '減少');

  return (
    <>
      <GlobalStyles />
      <div className={cn('min-h-screen pb-24', appClasses)}>
        <div className="min-h-screen flex flex-col items-center p-0 sm:p-6">
          <Header theme={theme} lang={lang} primaryColors={primaryColors} />

          <main className="w-full max-w-4xl px-3 sm:px-4 pb-6">
            <div
              className={cn(
                'mt-2 sm:mt-4 rounded-3xl sm:rounded-[2rem] border shadow-2xl overflow-hidden',
                theme === 'light'
                  ? 'bg-white border-gray-100'
                  : 'bg-slate-900/40 border-white/5 backdrop-blur-2xl'
              )}
            >
              <div className="p-5 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                      {lang === 'en' ? 'Dashboard' : 'ダッシュボード'}
                    </p>
                    <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {lang === 'en' ? 'Monthly comparison' : '月次比較'}
                    </h2>
                  </div>
                  <div className={cn('p-3 rounded-2xl', primaryColors.bgLight + '/20 dark:bg-white/10')}>
                    <BarChart3 className={cn('w-6 h-6', primaryColors.text)} />
                  </div>
                </div>

                {loading ? (
                  <div className="mt-8 space-y-4">
                    <div className="h-16 rounded-2xl bg-black/5 dark:bg-white/10 animate-pulse" />
                    <div className="h-16 rounded-2xl bg-black/5 dark:bg-white/10 animate-pulse" />
                    <div className="h-20 rounded-2xl bg-black/5 dark:bg-white/10 animate-pulse" />
                  </div>
                ) : (
                  <div className="mt-8 space-y-4">
                    <div
                      className={cn(
                        'rounded-2xl border p-4 sm:p-5',
                        theme === 'light' ? 'border-gray-100 bg-white' : 'border-white/5 bg-slate-900/30'
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-bold tracking-wide text-gray-500 dark:text-gray-400">
                          {lang === 'en' ? 'Chart' : 'グラフ'}
                        </p>

                        <div className="flex items-center gap-1 rounded-xl border px-1 py-1 text-[11px] font-bold
                          border-gray-200 bg-white text-gray-700
                          dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                        >
                          <button
                            type="button"
                            onClick={() => setRangeMode('weekly')}
                            className={cn(
                              'px-2 py-1 rounded-lg transition',
                              rangeMode === 'weekly'
                                ? cn(primaryColors.bgLight, 'text-white')
                                : 'hover:bg-black/5 dark:hover:bg-white/10'
                            )}
                          >
                            {lang === 'en' ? 'Weekly' : '週'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRangeMode('monthly')}
                            className={cn(
                              'px-2 py-1 rounded-lg transition',
                              rangeMode === 'monthly'
                                ? cn(primaryColors.bgLight, 'text-white')
                                : 'hover:bg-black/5 dark:hover:bg-white/10'
                            )}
                          >
                            {lang === 'en' ? 'Monthly' : '月'}
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 p-2 h-60 overflow-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          {(() => {
                            const data = rangeMode === 'weekly' ? weeklySeries : monthlySeries;
                            const palette = ['#22c55e', '#60a5fa', '#a78bfa', '#f59e0b', '#ef4444', '#14b8a6'];

                            if (chartStyle === ('pie' as ChartStyle)) {
                              return (
                                <PieChart>
                                  <Pie
                                    data={data}
                                    dataKey="pay"
                                    nameKey="label"
                                    innerRadius={42}
                                    outerRadius={70}
                                    paddingAngle={2}
                                  >
                                    {data.map((_, i) => (
                                      <Cell key={i} fill={palette[i % palette.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    contentStyle={{
                                      background: theme === 'light' ? '#ffffff' : '#0f172a',
                                      border:
                                        theme === 'light'
                                          ? '1px solid #e5e7eb'
                                          : '1px solid rgba(255,255,255,0.12)',
                                      borderRadius: 12
                                    }}
                                    formatter={(v: any) => [
                                      yen.format(Number(v)),
                                      lang === 'en' ? 'Pay' : '収入'
                                    ]}
                                  />
                                  {/* show labels outside hover, without overflowing */}
                                  <text
                                    x={12}
                                    y={18}
                                    fill={theme === 'light' ? '#111827' : 'rgba(255,255,255,0.85)'}
                                    fontSize={12}
                                    fontWeight={700}
                                  >
                                    {lang === 'en' ? 'Total:' : '合計:'} {yen.format(data.reduce((a, d) => a + (d.pay ?? 0), 0))}
                                  </text>
                                </PieChart>
                              );
                            }

                            if (chartStyle === ('bar' as ChartStyle)) {
                              return (
                                <BarChart data={data}>
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke={theme === 'light' ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}
                                  />
                                  <XAxis
                                    dataKey="label"
                                    stroke={theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.6)'}
                                    fontSize={11}
                                  />
                                  <YAxis
                                    stroke={theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.6)'}
                                    fontSize={11}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      background: theme === 'light' ? '#ffffff' : '#0f172a',
                                      border:
                                        theme === 'light'
                                          ? '1px solid #e5e7eb'
                                          : '1px solid rgba(255,255,255,0.12)',
                                      borderRadius: 12
                                    }}
                                    formatter={(v: any) => [
                                      yen.format(Number(v)),
                                      lang === 'en' ? 'Pay' : '収入'
                                    ]}
                                  />
                                  <Bar
                                    dataKey="pay"
                                    radius={[10, 10, 0, 0]}
                                  >
                                    {data.map((_, i) => (
                                      <Cell key={i} fill={palette[i % palette.length]} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              );
                            }

                            // line (default)
                            const compactYen = (n: number) => {
                              if (!Number.isFinite(n) || n <= 0) return '';
                              if (n >= 1000000) return `¥${Math.round(n / 100000) / 10}M`;
                              if (n >= 1000) return `¥${Math.round(n / 100) / 10}k`;
                              return yen.format(Math.round(n));
                            };

                            return (
                              <LineChart
                                data={data}
                                margin={{ top: 18, right: 12, left: 0, bottom: 0 }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke={theme === 'light' ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}
                                />
                                <XAxis
                                  dataKey="label"
                                  stroke={theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.6)'}
                                  fontSize={11}
                                />
                                <YAxis
                                  stroke={theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.6)'}
                                  fontSize={11}
                                />
                                <Tooltip
                                  contentStyle={{
                                    background: theme === 'light' ? '#ffffff' : '#0f172a',
                                    border:
                                      theme === 'light'
                                        ? '1px solid #e5e7eb'
                                        : '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: 20,
                                    paddingTop: 5,
                                    paddingBottom: 5,
                                    paddingRight: 10,
                                    paddingLeft: 10,
                                    boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",

                                  }}
                                  formatter={(v: any) => [
                                    yen.format(Number(v)),
                                    lang === 'en' ? 'Pay' : '収入'
                                  ]}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="pay"
                                  stroke={palette[0]}
                                  strokeWidth={3}
                                  dot={{ r: 3, strokeWidth: 0, fill: palette[4] }}
                                  activeDot={{ r: 5 }}
                                >
                                  <LabelList
                                    dataKey="pay"
                                    position="top"
                                    offset={10}
                                    formatter={(v: any) => compactYen(Number(v))}
                                    fill={theme === 'light' ? '#111827' : 'rgba(255,255,255,0.85)'}
                                    fontSize={10}
                                  />
                                </Line>
                              </LineChart>
                            );
                          })()}
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div
                        className={cn(
                          'rounded-2xl border p-4 sm:p-5',
                          theme === 'light' ? 'border-gray-100 bg-gray-50' : 'border-white/5 bg-white/5'
                        )}
                      >
                        <p className="text-xs font-bold tracking-wide text-gray-500 dark:text-gray-400">
                          {lang === 'en' ? 'This month' : '今月'} ({thisMonth?.monthKey})
                        </p>
                        <p className={cn('mt-2 text-3xl font-bold tracking-tight', primaryColors.text)}>
                          {yen.format(thisMonth?.totalPay ?? 0)}
                        </p>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                          {Math.round(thisMonth?.totalHours ?? 0)} {lang === 'en' ? 'hours' : '時間'} •{' '}
                          {thisMonth?.shiftCount ?? 0} {lang === 'en' ? 'shifts' : '回'}
                        </div>
                      </div>

                      <div
                        className={cn(
                          'rounded-2xl border p-4 sm:p-5',
                          theme === 'light' ? 'border-gray-100 bg-gray-50' : 'border-white/5 bg-white/5'
                        )}
                      >
                        <p className="text-xs font-bold tracking-wide text-gray-500 dark:text-gray-400">
                          {lang === 'en' ? 'Last month' : '先月'} ({lastMonth?.monthKey})
                        </p>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                          {yen.format(lastMonth?.totalPay ?? 0)}
                        </p>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                          {Math.round(lastMonth?.totalHours ?? 0)} {lang === 'en' ? 'hours' : '時間'} •{' '}
                          {lastMonth?.shiftCount ?? 0} {lang === 'en' ? 'shifts' : '回'}
                        </div>
                      </div>

                      <div
                        className={cn(
                          'sm:col-span-2 rounded-2xl border p-4 sm:p-5 flex items-center justify-between gap-4',
                          theme === 'light' ? 'border-gray-100 bg-white' : 'border-white/5 bg-slate-900/30'
                        )}
                      >
                        <div>
                          <p className="text-xs font-bold tracking-wide text-gray-500 dark:text-gray-400">
                            {lang === 'en' ? 'Change' : '差分'}
                          </p>
                          <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {deltaPayLabel}: {yen.format(Math.abs(deltaPay))}
                          </p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 font-medium">
                            {lang === 'en' ? 'Hours' : '時間'}: {Math.round(Math.abs(deltaHours))}
                          </p>
                        </div>
                        <div className={cn('p-3 rounded-2xl', deltaPay >= 0 ? 'bg-green-500/10' : 'bg-red-500/10')}>
                          {deltaPay >= 0 ? (
                            <ArrowUpRight className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowDownRight className="w-6 h-6 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          <BottomTabBar theme={theme} primaryColors={primaryColors} />
        </div >
      </div >
    </>
  );
}
