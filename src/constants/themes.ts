export const getPrimaryColorClasses = (variantIndex: number, theme: 'light' | 'dark') => {
    const variants = [
        { // Aqua Mist
            text: theme === 'light' ? 'text-cyan-600' : 'text-cyan-400',
            bgLight: 'bg-cyan-100',
            bgDark: 'bg-cyan-900/60',
            border: theme === 'light' ? 'border-cyan-500' : 'border-cyan-400',
            bgGradient: 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600',
            hover: 'hover:bg-cyan-500/10',
            ring: theme === 'light' ? 'ring-cyan-500' : 'ring-cyan-400',
        },
        { // Coral Glow
            text: theme === 'light' ? 'text-orange-600' : 'text-orange-400',
            bgLight: 'bg-orange-100',
            bgDark: 'bg-orange-900/60',
            border: theme === 'light' ? 'border-orange-500' : 'border-orange-400',
            bgGradient: 'bg-gradient-to-r from-rose-500 via-orange-500 to-yellow-600',
            hover: 'hover:bg-orange-500/10',
            ring: theme === 'light' ? 'ring-orange-500' : 'ring-orange-400',
        },
        { // Emerald Breeze
            text: theme === 'light' ? 'text-emerald-600' : 'text-emerald-400',
            bgLight: 'bg-emerald-100',
            bgDark: 'bg-emerald-900/60',
            border: theme === 'light' ? 'border-emerald-500' : 'border-emerald-400',
            bgGradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600',
            hover: 'hover:bg-emerald-500/10',
            ring: theme === 'light' ? 'ring-emerald-500' : 'ring-emerald-400',
        },
        { // Violet Horizon
            text: theme === 'light' ? 'text-violet-600' : 'text-violet-400',
            bgLight: 'bg-violet-100',
            bgDark: 'bg-violet-900/60',
            border: theme === 'light' ? 'border-violet-500' : 'border-violet-400',
            bgGradient: 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-600',
            hover: 'hover:bg-violet-500/10',
            ring: theme === 'light' ? 'ring-violet-500' : 'ring-violet-400',
        },
        { // Midnight Ocean
            text: theme === 'light' ? 'text-blue-600' : 'text-blue-400',
            bgLight: 'bg-blue-100',
            bgDark: 'bg-blue-900/60',
            border: theme === 'light' ? 'border-blue-500' : 'border-blue-400',
            bgGradient: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600',
            hover: 'hover:bg-blue-500/10',
            ring: theme === 'light' ? 'ring-blue-500' : 'ring-blue-400',
        },
        { // Sunset Fire
            text: theme === 'light' ? 'text-red-600' : 'text-red-400',
            bgLight: 'bg-red-100',
            bgDark: 'bg-red-900/60',
            border: theme === 'light' ? 'border-red-500' : 'border-red-400',
            bgGradient: 'bg-gradient-to-r from-red-500 via-pink-500 to-orange-600',
            hover: 'hover:bg-red-500/10',
            ring: theme === 'light' ? 'ring-red-500' : 'ring-red-400',
        },
        { // Electric Lime
            text: theme === 'light' ? 'text-lime-600' : 'text-lime-400',
            bgLight: 'bg-lime-100',
            bgDark: 'bg-lime-900/60',
            border: theme === 'light' ? 'border-lime-500' : 'border-lime-400',
            bgGradient: 'bg-gradient-to-r from-lime-500 via-yellow-500 to-green-600',
            hover: 'hover:bg-lime-500/10',
            ring: theme === 'light' ? 'ring-lime-500' : 'ring-lime-400',
        },
        { // Royal Purple
            text: theme === 'light' ? 'text-purple-600' : 'text-purple-400',
            bgLight: 'bg-purple-100',
            bgDark: 'bg-purple-900/60',
            border: theme === 'light' ? 'border-purple-500' : 'border-purple-400',
            bgGradient: 'bg-gradient-to-r from-purple-500 via-indigo-500 to-violet-600',
            hover: 'hover:bg-purple-500/10',
            ring: theme === 'light' ? 'ring-purple-500' : 'ring-purple-400',
        },
    ];
    return variants[variantIndex] || variants[3];
};

export const THEME_VARIANTS = [
    {
        name: 'Aqua Mist',
        light: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-white animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-cyan-300 to-sky-300',
        dark: 'bg-gradient-to-br from-cyan-800 via-sky-700 to-blue-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-cyan-600 to-sky-600'
    },
    {
        name: 'Coral Glow',
        light: 'bg-gradient-to-br from-rose-50 via-orange-50 to-yellow-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-rose-300 to-orange-300',
        dark: 'bg-gradient-to-br from-rose-800 via-orange-700 to-yellow-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-rose-600 to-orange-600'
    },
    {
        name: 'Emerald Breeze',
        light: 'bg-gradient-to-br from-emerald-50 via-lime-50 to-green-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-emerald-300 to-lime-300',
        dark: 'bg-gradient-to-br from-emerald-800 via-lime-700 to-green-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-emerald-600 to-lime-600'
    },
    {
        name: 'Violet Horizon',
        light: 'bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-violet-300 to-fuchsia-300',
        dark: 'bg-gradient-to-br from-violet-800 via-fuchsia-700 to-pink-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-violet-600 to-fuchsia-600'
    },
    {
        name: 'Midnight Ocean',
        light: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-blue-300 to-indigo-300',
        dark: 'bg-gradient-to-br from-blue-800 via-indigo-700 to-sky-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-blue-600 to-indigo-600'
    },
    {
        name: 'Sunset Fire',
        light: 'bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-red-400 to-pink-400',
        dark: 'bg-gradient-to-br from-red-900 via-pink-800 to-rose-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-red-600 to-pink-600'
    },
    {
        name: 'Electric Lime',
        light: 'bg-gradient-to-br from-lime-50 via-yellow-50 to-green-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-lime-400 to-yellow-400',
        dark: 'bg-gradient-to-br from-lime-900 via-yellow-800 to-green-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-lime-600 to-yellow-600'
    },
    {
        name: 'Royal Purple',
        light: 'bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-purple-400 to-indigo-400',
        dark: 'bg-gradient-to-br from-purple-900 via-indigo-800 to-violet-800 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-purple-600 to-indigo-600'
    },
    {
        name: 'Cherry Blossom',
        light: 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-pink-300 via-rose-300 to-red-300',
        dark: 'bg-gradient-to-br from-pink-900 via-rose-800 to-red-900 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-pink-600 via-rose-600 to-red-600'
    },
    {
        name: 'Forest Dawn',
        light: 'bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-green-300 via-teal-300 to-emerald-300',
        dark: 'bg-gradient-to-br from-green-900 via-teal-800 to-emerald-900 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-green-600 via-teal-600 to-emerald-600'
    },
    {
        name: 'Golden Hour',
        light: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-amber-300 via-yellow-300 to-orange-300',
        dark: 'bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-600'
    },
    {
        name: 'Arctic Frost',
        light: 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-slate-300 via-gray-300 to-zinc-300',
        dark: 'bg-gradient-to-br from-slate-900 via-gray-800 to-zinc-900 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-slate-600 via-gray-600 to-zinc-600'
    },
    {
        name: 'Tropical Sunset',
        light: 'bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-orange-300 via-pink-300 to-purple-300',
        dark: 'bg-gradient-to-br from-orange-900 via-pink-800 to-purple-900 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-orange-600 via-pink-600 to-purple-600'
    },
    {
        name: 'Ocean Depths',
        light: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 animate-gradient-x',
        lightPreview: 'bg-gradient-to-br from-blue-300 via-cyan-300 to-teal-300',
        dark: 'bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-900 animate-gradient-x',
        darkPreview: 'bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600'
    },
];