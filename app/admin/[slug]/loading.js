'use client';

import { Box, Container, Skeleton, Stack, Grid, Paper } from '@mui/material';

export default function RestaurantAdminLoading() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 10 }}>
      {/* Top Nav Loading */}
      <Box sx={{ height: 64, bgcolor: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', px: 4, mb: 4 }}>
        <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: '12px' }} />
        <Skeleton variant="text" width={150} sx={{ ml: 2 }} />
      </Box>

      <Container maxWidth="lg">
        {/* Subscription Banner Loading */}
        <Box sx={{ p: 4, bgcolor: 'white', borderRadius: '24px', border: '1px solid #e5e7eb', mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Skeleton variant="text" width="100px" height={24} />
            <Skeleton variant="text" width="300px" />
          </Stack>
          <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: '12px' }} />
        </Box>

        {/* Dashboard Header Loading */}
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Stack spacing={1}>
            <Skeleton variant="text" width="250px" height={48} />
            <Skeleton variant="text" width="350px" />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Skeleton variant="rectangular" width={140} height={44} sx={{ borderRadius: '12px' }} />
            <Skeleton variant="rectangular" width={120} height={44} sx={{ borderRadius: '12px' }} />
          </Stack>
        </Box>

        {/* Tabs Loading */}
        <Stack direction="row" spacing={4} sx={{ mb: 4, borderBottom: '1px solid #e5e7eb' }}>
          <Skeleton variant="text" width={100} height={40} />
          <Skeleton variant="text" width={100} height={40} />
          <Skeleton variant="text" width={100} height={40} />
        </Stack>

        {/* List Content Loading */}
        <Paper sx={{ borderRadius: '24px', overflow: 'hidden' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Skeleton variant="rectangular" width={60} height={60} sx={{ borderRadius: '12px' }} />
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="20%" />
              </Stack>
              <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: '20px' }} />
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          ))}
        </Paper>
      </Container>
    </Box>
  );
}
