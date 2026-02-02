import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={toggleTheme}
      className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700/50 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md active:scale-95"
      aria-label="Alternar tema"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun 
          className={`absolute w-5 h-5 text-amber-500 transition-all duration-500 transform ${
            theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`} 
        />
        <Moon 
          className={`absolute w-5 h-5 text-indigo-400 transition-all duration-500 transform ${
            theme === 'light' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`} 
        />
      </div>
    </button>
  );
}
