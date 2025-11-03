import { Injectable, signal, computed, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private theme = signal<'light' | 'dark'>(this.getStoredTheme());
  public currentTheme = this.theme.asReadonly();
  public isDarkMode = computed(() => this.theme() === 'dark');

  constructor() {
    // Apply theme when it changes
    effect(() => {
      const theme = this.theme();
      this.applyTheme(theme);
      localStorage.setItem('theme', theme);
    });
  }

  toggleTheme(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.theme.set(theme);
  }

  private getStoredTheme(): 'light' | 'dark' {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark-mode');
    } else {
      html.classList.remove('dark-mode');
    }
  }
}

