'use client';

import { Box, Container, Skeleton, Stack, Grid } from '@mui/material';

export default function AdminLoading() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: { xs: 2, sm: 8 } }}>
      <Container maxWidth="lg">
        {/* Top Header Loading */}
        <Box sx={{ mb: 6 }}>
          <Skeleton variant="text" width="200px" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Skeleton variant="text" width="300px" height={24} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
        </Box>

        {/* Stats Row Loading */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '24px', p: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
                <Skeleton variant="text" width="40%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                <Skeleton variant="text" width="60%" height={48} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* List Header */}
        <Skeleton variant="text" width="150px" height={32} sx={{ mb: 4, bgcolor: 'rgba(255,255,255,0.05)' }} />

        {/* Restaurants Grid Loading */}
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Skeleton variant="rectangular" height={120} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                <Box sx={{ p: 3 }}>
                  <Skeleton variant="circular" width={60} height={60} sx={{ mt: -6, border: '4px solid #0a0a0a', bgcolor: 'rgba(255,255,255,0.1)' }} />
                  <Skeleton variant="text" width="70%" height={32} sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
                  <Skeleton variant="text" width="50%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
