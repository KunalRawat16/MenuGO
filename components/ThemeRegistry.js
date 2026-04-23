'use client';
import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMemo } from 'react';

export default function ThemeRegistry({ children }) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: {
            main: '#22c55e', // Emerald Green
          },
          background: {
            default: '#f8fafc',
            paper: '#ffffff',
          },
          text: {
            primary: '#0f172a',
            secondary: '#64748b',
          },
          divider: 'rgba(0,0,0,0.08)',
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
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
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
    []
  );

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div suppressHydrationWarning>
          {children}
        </div>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
