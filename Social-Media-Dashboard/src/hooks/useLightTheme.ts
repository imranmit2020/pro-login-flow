import { useEffect } from 'react';

/**
 * Hook that enforces light theme and prevents dark mode
 * This overrides any system preferences or user settings
 */
export function useLightTheme() {
  useEffect(() => {
    // Force light theme on mount
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    
    // Store in localStorage
    localStorage.setItem('theme', 'light');
    localStorage.setItem('systemTheme', 'light');
    
    // Override any existing theme
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          if (target.classList.contains('dark')) {
            target.classList.remove('dark');
            target.classList.add('light');
          }
        }
      });
    });
    
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  return {
    theme: 'light',
    setTheme: () => {}, // No-op function
    systemTheme: 'light',
    resolvedTheme: 'light'
  };
}
