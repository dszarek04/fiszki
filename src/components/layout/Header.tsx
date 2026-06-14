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
import { cn } from '@/lib/utils';
import { useLocale } from '@/providers/I18nProvider';

const UKFlag = () => (
  <svg
    width="16"
    height="12"
    viewBox="0 0 60 30"
    className="rounded-xs border border-muted-foreground/20 shrink-0"
    aria-hidden="true"
  >
    <rect width="60" height="30" fill="#012169" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2" />
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

const PolandFlag = () => (
  <svg
    width="16"
    height="12"
    viewBox="0 0 16 10"
    className="rounded-xs border border-muted-foreground/20 shrink-0"
    aria-hidden="true"
  >
    <rect width="16" height="5" fill="#fff" />
    <rect y="5" width="16" height="5" fill="#dc2626" />
  </svg>
);

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
                className="gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border/40 hover:bg-muted/50 px-2.5 py-1.5 h-8"
                id="language-selector"
                aria-label={t('language')}
              >
                {locale === 'en' ? <UKFlag /> : <PolandFlag />}
                <span className="uppercase tracking-wider">{locale}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px] p-1.5 space-y-1">
              <DropdownMenuItem
                onClick={() => setLocale('en')}
                className={cn(
                  'flex items-center gap-2.5 py-2 px-2.5 cursor-pointer font-medium transition-colors w-full',
                  locale === 'en' ? 'bg-accent text-accent-foreground' : ''
                )}
              >
                <UKFlag />
                <span>English</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocale('pl')}
                className={cn(
                  'flex items-center gap-2.5 py-2 px-2.5 cursor-pointer font-medium transition-colors w-full',
                  locale === 'pl' ? 'bg-accent text-accent-foreground' : ''
                )}
              >
                <PolandFlag />
                <span>Polski</span>
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
