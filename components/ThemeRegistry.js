'use client';
import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMemo, useState, useEffect, createContext } from 'react';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export default function ThemeRegistry({ children }) {
  const [mode, setMode] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode) {
      setMode(savedMode);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setMode('dark');
    }
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('theme-mode', newMode);
          return newMode;
        });
      },
      mode
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#22c55e',
          },
          background: {
            default: mode === 'light' ? '#f8fafc' : '#0f172a',
            paper: mode === 'light' ? '#ffffff' : '#1e293b',
          },
          text: {
            primary: mode === 'light' ? '#0f172a' : '#f8fafc',
            secondary: mode === 'light' ? '#64748b' : '#94a3b8',
          },
          divider: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
        },
        typography: {
          fontFamily: 'var(--font-geist-sans), Arial, sans-serif',
          h1: { fontWeight: 800 },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 700 },
          body1: { lineHeight: 1.6 },
        },
        shape: {
          borderRadius: 16,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 12,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light' 
                  ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                  : '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
                border: '1px solid',
                borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                backgroundImage: 'none',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* 
            Structure must be identical on server and client to avoid hydration errors.
            We use suppressHydrationWarning here as a last resort for attributes 
            injected by browser extensions (like bis_skin_checked).
          */}
          <div 
            suppressHydrationWarning 
            style={{ 
              opacity: mounted ? 1 : 0, 
              transition: 'opacity 0.2s ease-in' 
            }}
          >
            {children}
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
