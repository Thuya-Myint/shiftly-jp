import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Palette,
  Sun,
  Moon,
  ChevronDown,
  Languages,
  Monitor,
  User,
  Edit3,
  X,
  Loader2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart3,
  Bell,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPrimaryColorClasses, THEME_VARIANTS } from '@/constants/themes';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { updateUserBalance } from '@/services/user';
import { BottomTabBar } from '@/components/BottomTabBar';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { getItemFromLocalStorage, setItemToLocalStorage } from '@/utils/localStorage';
import { STORAGE_KEYS } from '@/constants';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    theme,
    variantIndex,
    lang,
    setTheme,
    setVariantIndex,
    setLang,
    chartRange,
    chartStyle,
    setChartRange,
    setChartStyle
  } = useTheme();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [newBalance, setNewBalance] = useState('');
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);

  useEffect(() => {
    const userData = getItemFromLocalStorage(STORAGE_KEYS.USER_DATA);
    if (userData) {
      setUserBalance(userData?.balance || 0);
    }
  }, []);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const primaryColors = getPrimaryColorClasses(variantIndex, theme);

  const weeklySeries = useMemo(
    () => [
      { label: lang === 'en' ? 'Mon' : '月', value: 12000 },
      { label: lang === 'en' ? 'Tue' : '火', value: 18000 },
      { label: lang === 'en' ? 'Wed' : '水', value: 8000 },
      { label: lang === 'en' ? 'Thu' : '木', value: 22000 },
      { label: lang === 'en' ? 'Fri' : '金', value: 15000 }
    ],
    [lang]
  );

  const monthlySeries = useMemo(
    () => [
      { label: lang === 'en' ? 'Jan' : '1月', value: 180000 },
      { label: lang === 'en' ? 'Feb' : '2月', value: 210000 },
      { label: lang === 'en' ? 'Mar' : '3月', value: 160000 },
      { label: lang === 'en' ? 'Apr' : '4月', value: 240000 }
    ],
    [lang]
  );

  const demoSeries = chartRange === 'weekly' ? weeklySeries : monthlySeries;

  const pieData = useMemo(
    () => [
      { name: lang === 'en' ? 'W1' : '第1週', value: 24000 },
      { name: lang === 'en' ? 'W2' : '第2週', value: 18000 },
      { name: lang === 'en' ? 'W3' : '第3週', value: 12000 },
      { name: lang === 'en' ? 'W4' : '第4週', value: 9000 }
    ],
    [lang]
  );

  const pieColors = useMemo(() => ['#16a34a', '#22c55e', '#4ade80', '#86efac'], []);
  const themeVariant = THEME_VARIANTS[variantIndex];
  const appClasses = theme === 'light' ? themeVariant.light : themeVariant.dark;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleBalanceUpdate = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    const balance = parseInt(newBalance) || 0;
    if (balance < 0) {
      console.error('Invalid balance amount');
      return;
    }

    setIsUpdatingBalance(true);
    try {
      const response = await updateUserBalance(user?.id, balance);
      if (response) {
        setUserBalance(balance);

        const userData = getItemFromLocalStorage(STORAGE_KEYS.USER_DATA) || {};
        userData.balance = balance;
        setItemToLocalStorage(STORAGE_KEYS.USER_DATA, userData);

        setIsBalanceModalOpen(false);
        setNewBalance('');
      }
    } catch (error) {
      console.error('Failed to update balance:', error);
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  const openBalanceModal = () => {
    setNewBalance(userBalance.toString());
    setIsBalanceModalOpen(true);
    // Scroll to top for iOS keyboard visibility
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className={cn("min-h-screen pb-24", appClasses)}>
      <div className="max-w-2xl mx-auto p-3 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
          <button
            onClick={() => navigate('/shifts')}
            className={cn(
              "p-1.5 sm:p-2 rounded-xl border-2",
              primaryColors.border,
              theme === 'light' ? 'bg-white' : 'bg-slate-800'
            )}
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
          </button>
          <h1 className={cn("text-xl sm:text-2xl font-bold tracking-tight", primaryColors.text)}>
            {lang === 'en' ? 'SETTINGS' : '設定'}
          </h1>
        </div>

        <div className="space-y-3 sm:space-y-6">
          {/* User Information */}
          <div className={cn(
            "rounded-3xl border overflow-hidden shadow-xl",
            theme === 'light' ? 'bg-white border-gray-100' : 'bg-slate-900/40 border-white/5 backdrop-blur-2xl'
          )}>
            <button
              onClick={() => toggleSection('user')}
              className={cn(
                "w-full flex items-center justify-between p-3 sm:p-6 text-left",
                theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={cn("p-2 sm:p-2.5 rounded-xl", theme === 'light' ? 'bg-gray-50' : 'bg-white/5')}>
                  <User size={20} className={cn("sm:w-[22px] sm:h-[22px]", primaryColors.text)} strokeWidth={2} />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {lang === 'en' ? 'User Profile' : 'ユーザー情報'}
                </span>
              </div>
              <ChevronDown
                size={20}
                className={cn(
                  "text-gray-400",
                  expandedSection === 'user' && 'rotate-180'
                )}
              />
            </button>
            {expandedSection === 'user' && (
              <div className={cn(
                "p-2.5 sm:p-4 border-t",
                theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-700/50'
              )}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white dark:border-slate-600"
                      />
                    ) : (
                      <div className={cn(
                        "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl",
                        primaryColors.bgGradient
                      )}>
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{userName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      theme === 'light' ? 'bg-white' : 'bg-slate-600'
                    )}>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {lang === 'en' ? 'Login Method' : 'ログイン方法'}
                      </p>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="font-medium text-gray-900 dark:text-white">Google</span>
                      </div>
                    </div>
                    <button
                      onClick={openBalanceModal}
                      className={cn(
                        "p-3 rounded-lg transition-colors hover:opacity-80 group",
                        theme === 'light' ? 'bg-white hover:bg-gray-50' : 'bg-slate-600 hover:bg-slate-500'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {lang === 'en' ? 'Balance' : '残高'}
                          </p>
                          <p className="font-bold text-green-600 dark:text-green-400">
                            ¥{userBalance.toLocaleString()}
                          </p>
                        </div>
                        <Edit3 size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Charts */}
          <div className={cn(
            "rounded-3xl border overflow-hidden shadow-xl",
            theme === 'light' ? 'bg-white border-gray-100' : 'bg-slate-900/40 border-white/5 backdrop-blur-2xl'
          )}>
            <button
              onClick={() => toggleSection('charts')}
              className={cn(
                "w-full flex items-center justify-between p-3 sm:p-6 text-left",
                theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={cn("p-2 sm:p-2.5 rounded-xl", theme === 'light' ? 'bg-gray-50' : 'bg-white/5')}>
                  <BarChart3 size={20} className={cn("sm:w-[22px] sm:h-[22px]", primaryColors.text)} strokeWidth={2} />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {lang === 'en' ? 'Charts' : 'グラフ'}
                </span>
              </div>
              <ChevronDown
                size={20}
                className={cn(
                  "text-gray-400",
                  expandedSection === 'charts' && 'rotate-180'
                )}
              />
            </button>

            {expandedSection === 'charts' && (
              <div className={cn(
                "p-3 sm:p-4 border-t",
                theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-700/50'
              )}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChartStyle('line')}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors",
                        chartStyle === 'line'
                          ? cn(primaryColors.bgGradient, "text-white")
                          : "bg-white/70 dark:bg-slate-600 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <LineChartIcon size={16} />
                      {lang === 'en' ? 'Line' : '折れ線'}
                    </button>
                    <button
                      onClick={() => setChartStyle('bar')}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors",
                        chartStyle === 'bar'
                          ? cn(primaryColors.bgGradient, "text-white")
                          : "bg-white/70 dark:bg-slate-600 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <BarChart3 size={16} />
                      {lang === 'en' ? 'Bar' : '棒'}
                    </button>
                    <button
                      onClick={() => setChartStyle('pie')}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors",
                        chartStyle === 'pie'
                          ? cn(primaryColors.bgGradient, "text-white")
                          : "bg-white/70 dark:bg-slate-600 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <PieChartIcon size={16} />
                      {lang === 'en' ? 'Pie' : '円'}
                    </button>
                  </div>

                  <select
                    value={chartRange}
                    onChange={(e) => setChartRange(e.target.value as any)}
                    className={cn(
                      "h-10 px-3 rounded-lg border text-sm font-semibold",
                      theme === 'light'
                        ? "bg-white border-gray-200 text-gray-700"
                        : "bg-slate-600 border-slate-500 text-gray-100"
                    )}
                  >
                    <option value="weekly">{lang === 'en' ? 'Weekly' : '週'}</option>
                    <option value="monthly">{lang === 'en' ? 'Monthly' : '月'}</option>
                  </select>
                </div>

                <div className={cn(
                  "h-56 rounded-2xl border p-3",
                  theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800/60 border-slate-600'
                )}>
                  <ResponsiveContainer width="100%" height="100%">
                    {chartStyle === 'line' ? (
                      <LineChart data={demoSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e5e7eb' : 'rgba(255,255,255,0.08)'} />
                        <XAxis dataKey="label" stroke={theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.6)'} fontSize={11} />
                        <YAxis stroke={theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.6)'} fontSize={11} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke={theme === 'light' ? '#16a34a' : '#4ade80'} strokeWidth={3} dot={false} />
                      </LineChart>
                    ) : chartStyle === 'bar' ? (
                      <BarChart data={demoSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e5e7eb' : 'rgba(255,255,255,0.08)'} />
                        <XAxis dataKey="label" stroke={theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.6)'} fontSize={11} />
                        <YAxis stroke={theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.6)'} fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="value" fill={theme === 'light' ? '#16a34a' : '#4ade80'} radius={[10, 10, 0, 0]} />
                      </BarChart>
                    ) : (
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={pieColors[i % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </div>

                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  {lang === 'en'
                    ? 'Chart style preview (you can later connect this to real shift data).'
                    : 'グラフ表示のプレビュー（後で実データに接続できます）'}
                </p>
              </div>
            )}
          </div>

          {/* Language */}
          <div className={cn(
            "rounded-3xl border overflow-hidden shadow-xl",
            theme === 'light' ? 'bg-white border-gray-100' : 'bg-slate-900/40 border-white/5 backdrop-blur-2xl'
          )}>
            <button
              onClick={() => toggleSection('language')}
              className={cn(
                "w-full flex items-center justify-between p-3 sm:p-6 text-left",
                theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={cn("p-2 sm:p-2.5 rounded-xl", theme === 'light' ? 'bg-gray-50' : 'bg-white/5')}>
                  <Languages size={20} className={cn("sm:w-[22px] sm:h-[22px]", primaryColors.text)} strokeWidth={2} />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {lang === 'en' ? 'Language' : '言語'}
                </span>
              </div>
              <ChevronDown
                size={20}
                className={cn(
                  "text-gray-400",
                  expandedSection === 'language' && 'rotate-180'
                )}
              />
            </button>
            {expandedSection === 'language' && (
              <div className={cn(
                "p-2.5 sm:p-4 border-t",
                theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-700/50'
              )}>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLang('en')}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-colors",
                      lang === 'en'
                        ? cn(primaryColors.bgGradient, "text-white")
                        : "bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLang('jp')}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-colors",
                      lang === 'jp'
                        ? cn(primaryColors.bgGradient, "text-white")
                        : "bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    日本語
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Mode */}
          <div className={cn(
            "rounded-3xl border overflow-hidden shadow-xl",
            theme === 'light' ? 'bg-white border-gray-100' : 'bg-slate-900/40 border-white/5 backdrop-blur-2xl'
          )}>
            <button
              onClick={() => toggleSection('theme')}
              className={cn(
                "w-full flex items-center justify-between p-3 sm:p-6 text-left",
                theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={cn("p-2 sm:p-2.5 rounded-xl", theme === 'light' ? 'bg-gray-50' : 'bg-white/5')}>
                  <Monitor size={20} className={cn("sm:w-[22px] sm:h-[22px]", primaryColors.text)} strokeWidth={2} />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {lang === 'en' ? 'Appearance' : 'テーマ'}
                </span>
              </div>
              <ChevronDown
                size={20}
                className={cn(
                  "text-gray-400",
                  expandedSection === 'theme' && 'rotate-180'
                )}
              />
            </button>
            {expandedSection === 'theme' && (
              <div className={cn(
                "p-2.5 sm:p-4 border-t",
                theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-700/50'
              )}>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                      theme === 'light'
                        ? cn(primaryColors.bgGradient, "text-white")
                        : "bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <Sun size={16} />
                    {lang === 'en' ? 'Light' : 'ライト'}
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                      theme === 'dark'
                        ? cn(primaryColors.bgGradient, "text-white")
                        : "bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <Moon size={16} />
                    {lang === 'en' ? 'Dark' : 'ダーク'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div
            className={cn(
              "rounded-3xl border overflow-hidden shadow-xl",
              theme === 'light'
                ? 'bg-white border-gray-100'
                : 'bg-slate-900/40 border-white/5 backdrop-blur-2xl'
            )}
          >
            <button
              onClick={() => toggleSection('notifications')}
              className={cn(
                "w-full flex items-center justify-between p-3 sm:p-6 text-left",
                theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={cn("p-2 sm:p-2.5 rounded-xl", theme === 'light' ? 'bg-gray-50' : 'bg-white/5')}>
                  <Bell
                    size={20}
                    className={cn("sm:w-[22px] sm:h-[22px]", primaryColors.text)}
                    strokeWidth={2}
                  />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {lang === 'en' ? 'Notifications' : '通知'}
                </span>
              </div>
              <ChevronDown
                size={20}
                className={cn("text-gray-400", expandedSection === 'notifications' && 'rotate-180')}
              />
            </button>

            {expandedSection === 'notifications' && (
              <div
                className={cn(
                  "p-2.5 sm:p-4 border-t space-y-3",
                  theme === 'light'
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-slate-700 bg-slate-700/50'
                )}
              >
                <label className="flex items-center justify-between gap-3 rounded-xl p-3 bg-white/70 dark:bg-slate-600">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {lang === 'en' ? 'Daily reminder' : '毎日のリマインダー'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                      {lang === 'en' ? 'Notify to add shifts' : 'シフト追加の通知'}
                    </p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 accent-green-600" />
                </label>

                <label className="flex items-center justify-between gap-3 rounded-xl p-3 bg-white/70 dark:bg-slate-600">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {lang === 'en' ? 'Monthly summary' : '月次サマリー'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                      {lang === 'en' ? 'Show monthly report notification' : '月次レポート通知'}
                    </p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 accent-green-600" defaultChecked />
                </label>
              </div>
            )}
          </div>

          {/* Privacy */}
          <div
            className={cn(
              "rounded-3xl border overflow-hidden shadow-xl",
              theme === 'light'
                ? 'bg-white border-gray-100'
                : 'bg-slate-900/40 border-white/5 backdrop-blur-2xl'
            )}
          >
            <button
              onClick={() => toggleSection('privacy')}
              className={cn(
                "w-full flex items-center justify-between p-3 sm:p-6 text-left",
                theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={cn("p-2 sm:p-2.5 rounded-xl", theme === 'light' ? 'bg-gray-50' : 'bg-white/5')}>
                  <ShieldCheck
                    size={20}
                    className={cn("sm:w-[22px] sm:h-[22px]", primaryColors.text)}
                    strokeWidth={2}
                  />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {lang === 'en' ? 'Privacy' : 'プライバシー'}
                </span>
              </div>
              <ChevronDown
                size={20}
                className={cn("text-gray-400", expandedSection === 'privacy' && 'rotate-180')}
              />
            </button>

            {expandedSection === 'privacy' && (
              <div
                className={cn(
                  "p-2.5 sm:p-4 border-t space-y-3",
                  theme === 'light'
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-slate-700 bg-slate-700/50'
                )}
              >
                <button
                  className={cn(
                    "w-full text-left rounded-xl p-3 border",
                    theme === 'light'
                      ? 'bg-white border-gray-200 hover:bg-gray-50'
                      : 'bg-slate-600 border-slate-500 hover:bg-slate-500'
                  )}
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {lang === 'en' ? 'Export data' : 'データを書き出す'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    {lang === 'en' ? 'Download your shifts as JSON (UI only)' : 'シフトをJSONでダウンロード（UIのみ）'}
                  </p>
                </button>

                <button
                  className={cn(
                    "w-full text-left rounded-xl p-3 border",
                    theme === 'light'
                      ? 'bg-white border-red-200 hover:bg-red-50'
                      : 'bg-slate-600 border-red-500/40 hover:bg-red-900/20'
                  )}
                >
                  <p className="font-semibold text-red-700 dark:text-red-300">
                    {lang === 'en' ? 'Delete account' : 'アカウント削除'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    {lang === 'en' ? 'Not implemented' : '未実装'}
                  </p>
                </button>
              </div>
            )}
          </div>

          {/* Color Palette */}
          <div className={cn(
            "rounded-3xl border overflow-hidden shadow-xl",
            theme === 'light' ? 'bg-white border-gray-100' : 'bg-slate-900/40 border-white/5 backdrop-blur-2xl'
          )}>
            <button
              onClick={() => toggleSection('colors')}
              className={cn(
                "w-full flex items-center justify-between p-3 sm:p-6 text-left",
                theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={cn("p-2 sm:p-2.5 rounded-xl", theme === 'light' ? 'bg-gray-50' : 'bg-white/5')}>
                  <Palette size={20} className={cn("sm:w-[22px] sm:h-[22px]", primaryColors.text)} strokeWidth={2} />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {lang === 'en' ? 'Color Palette' : 'カラーパレット'}
                </span>
              </div>
              <ChevronDown
                size={20}
                className={cn(
                  "text-gray-400",
                  expandedSection === 'colors' && 'rotate-180'
                )}
              />
            </button>
            {expandedSection === 'colors' && (
              <div className={cn(
                "p-2.5 sm:p-4 border-t",
                theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-700/50'
              )}>
                <div className="grid grid-cols-2 gap-3">
                  {THEME_VARIANTS.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => setVariantIndex(index)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg transition-colors border-2",
                        index === variantIndex
                          ? cn(primaryColors.border, primaryColors.bgLight + '/20 dark:' + primaryColors.bgDark + '/20')
                          : "border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600"
                      )}
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {variant.name}
                      </span>
                      <div className="flex gap-1">
                        <div className={cn("w-4 h-4 rounded-full", variant.lightPreview)} />
                        <div className={cn("w-4 h-4 rounded-full", variant.darkPreview)} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Balance Edit Modal */}
      {isBalanceModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20"
          onClick={() => setIsBalanceModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-xl",
              theme === 'light' ? 'bg-white' : 'bg-slate-800'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {lang === 'en' ? 'Edit Balance' : '残高を編集'}
              </h3>
              <button
                onClick={() => setIsBalanceModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'en' ? 'New Balance (¥)' : '新しい残高 (¥)'}
              </label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                onInput={(e) => setNewBalance((e.target as HTMLInputElement).value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border-2 transition-colors text-lg",
                  "focus:outline-none focus:ring-0",
                  primaryColors.border,
                  theme === 'light'
                    ? 'bg-white text-gray-900'
                    : 'bg-slate-700 text-white border-slate-600'
                )}
                placeholder="0"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setIsBalanceModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                {lang === 'en' ? 'Cancel' : 'キャンセル'}
              </Button>
              <Button
                onClick={handleBalanceUpdate}
                disabled={isUpdatingBalance}
                className={cn("flex-1 text-white", primaryColors.bgGradient)}
              >
                {isUpdatingBalance ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    {lang === 'en' ? 'Saving...' : '保存中...'}
                  </>
                ) : (
                  lang === 'en' ? 'Save' : '保存'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomTabBar theme={theme} primaryColors={primaryColors} />
    </div>
  );
}
