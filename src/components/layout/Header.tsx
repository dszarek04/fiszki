'use client';

import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Moon, Sun, Monitor, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/providers/I18nProvider';

export function Header() {
  const t = useTranslations('nav');
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();

  return (
    <header className="w-full">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-end px-4 sm:px-6">

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                id="language-selector"
                aria-label={t('language')}
              >
                <Languages className="h-3.5 w-3.5" />
                <span className="uppercase">{locale}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              <DropdownMenuItem
                onClick={() => setLocale('en')}
                className={locale === 'en' ? 'bg-accent' : ''}
              >
                🇬🇧&nbsp; English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocale('pl')}
                className={locale === 'pl' ? 'bg-accent' : ''}
              >
                🇵🇱&nbsp; Polski
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                id="theme-toggle"
                aria-label={t('theme')}
              >
                {theme === 'light' ? (
                  <Sun className="h-4 w-4" />
                ) : theme === 'dark' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-3.5 w-3.5" />
                {t('light')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-3.5 w-3.5" />
                {t('dark')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-3.5 w-3.5" />
                {t('system')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
