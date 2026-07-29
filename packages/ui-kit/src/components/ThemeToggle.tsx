import { useTheme } from 'next-themes';

import { Moon, Sun } from '@ergo-raffle/icons';

import { Button } from './Button';

type ThemeToggleProps = {
  className?: string;
};

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      variant="primary-soft"
      size="icon"
      className={className}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      suppressHydrationWarning
    >
      <Moon suppressHydrationWarning className="dark:hidden" />
      <Sun suppressHydrationWarning className="hidden dark:block" />
    </Button>
  );
};
