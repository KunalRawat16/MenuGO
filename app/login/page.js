'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Utensils, ArrowLeft } from 'lucide-react';
import { loginAction } from '@/app/actions';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  Paper, 
  Alert,
  Link as MuiLink,
  Fade
} from '@mui/material';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const BRAND_COLOR = '#22c55e';

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await loginAction(username, password);

      if (res.success) {
        if (res.role === 'superadmin') {
          router.push('/admin');
        } else {
          router.push(`/admin/${res.slug}`);
        }
      } else {
        setError(res.error || 'Invalid username or password');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3,
      fontFamily: 'var(--font-geist-sans), Arial, sans-serif'
    }}>
      <Container maxWidth="xs">
        {/* Minimalist Logo Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 1.5,
              mb: 2,
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.02)' }
            }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                bgcolor: BRAND_COLOR, 
                borderRadius: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white',
                boxShadow: `0 8px 16px -4px ${BRAND_COLOR}40`
              }}>
                <Utensils size={24} style={{ margin: 'auto' }} />
              </Box>
              <Typography sx={{ 
                fontWeight: 900, 
                fontSize: '2rem', 
                letterSpacing: '-0.04em', 
                color: '#0f172a' 
              }}>
                Menu<Box component="span" sx={{ color: BRAND_COLOR }}>Go</Box>
              </Typography>
            </Box>
          </Link>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.01em' }}>
            RESTAURANT ADMIN CONSOLE
          </Typography>
        </Box>

        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 5 },
              borderRadius: '32px',
              border: '1px solid',
              borderColor: 'rgba(226, 232, 240, 0.8)',
              bgcolor: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.035)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Ambient Background Glow */}
            <Box sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 200,
              height: 200,
              background: `radial-gradient(circle, ${BRAND_COLOR}08 0%, rgba(255,255,255,0) 70%)`,
              pointerEvents: 'none'
            }} />

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
                  Welcome back
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                  Enter your credentials to manage your menu
                </Typography>
              </Box>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    borderRadius: '16px', 
                    fontWeight: 600,
                    bgcolor: '#fef2f2',
                    color: '#991b1b',
                    border: '1px solid #fee2e2',
                    '& .MuiAlert-icon': { color: '#ef4444' }
                  }}
                >
                  {error}
                </Alert>
              )}

              <TextField
                placeholder="Username"
                fullWidth
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={18} color="#94a3b8" />
                      </InputAdornment>
                    ),
                    sx: { 
                      borderRadius: '16px',
                      bgcolor: '#f8fafc',
                      '& fieldset': { borderColor: '#e2e8f0' },
                      '&:hover fieldset': { borderColor: BRAND_COLOR },
                      '&.Mui-focused fieldset': { borderColor: BRAND_COLOR, borderWidth: '2px' },
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }
                  }
                }}
              />

              <TextField
                placeholder="Password"
                type="password"
                fullWidth
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={18} color="#94a3b8" />
                      </InputAdornment>
                    ),
                    sx: { 
                      borderRadius: '16px',
                      bgcolor: '#f8fafc',
                      '& fieldset': { borderColor: '#e2e8f0' },
                      '&:hover fieldset': { borderColor: BRAND_COLOR },
                      '&.Mui-focused fieldset': { borderColor: BRAND_COLOR, borderWidth: '2px' },
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }
                  }
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <MuiLink 
                  component={Link} 
                  href="#" 
                  sx={{ 
                    color: BRAND_COLOR, 
                    fontSize: '0.8rem', 
                    fontWeight: 700, 
                    textDecoration: 'none',
                    '&:hover': { opacity: 0.8 }
                  }}
                >
                  Forgot password?
                </MuiLink>
              </Box>

              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                variant="contained"
                sx={{
                  bgcolor: BRAND_COLOR,
                  color: 'white',
                  py: 1.8,
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  boxShadow: `0 12px 24px -6px ${BRAND_COLOR}40`,
                  mt: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#16a34a',
                    boxShadow: `0 16px 32px -8px ${BRAND_COLOR}50`,
                    transform: 'translateY(-2px)'
                  },
                  '&:active': { transform: 'translateY(0)' },
                  '&.Mui-disabled': { bgcolor: '#94a3b8' }
                }}
              >
                {isLoading ? 'Processing...' : 'Sign in to Dashboard'}
              </Button>
            </form>
          </Paper>
        </Fade>

        {/* Footer Link */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <ArrowLeft size={16} color="#94a3b8" />
            <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600, '&:hover': { color: '#475569' } }}>
              Back to Home
            </Typography>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
