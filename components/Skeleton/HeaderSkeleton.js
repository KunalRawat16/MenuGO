'use client';

import { Box, Container, Skeleton, Stack } from '@mui/material';

export default function HeaderSkeleton() {
  return (
    <Box sx={{ position: 'relative', width: '100%', mb: '15px' }}>
      {/* Banner Skeleton */}
      <Skeleton 
        variant="rectangular" 
        height={260} 
        width="100%" 
        animation="wave"
        sx={{ bgcolor: 'rgba(0,0,0,0.06)' }}
      />

      <Box sx={{
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        p: 3,
        zIndex: 1
      }}>
        <Container maxWidth="md">
          <Skeleton variant="text" width="50%" height={48} animation="wave" sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }} />
          <Skeleton variant="text" width="30%" height={24} animation="wave" sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
          
          <Stack direction="row" spacing={3}>
            <Skeleton variant="rectangular" width={60} height={20} animation="wave" sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
            <Skeleton variant="rectangular" width={60} height={20} animation="wave" sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
            <Skeleton variant="rectangular" width={60} height={20} animation="wave" sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
          </Stack>
        </Container>
      </Box>

      {/* Search Bar Skeleton Overlay */}
      <Container maxWidth="md" sx={{ mt: -4, position: 'relative', zIndex: 10 }}>
        <Skeleton 
          variant="rectangular" 
          height={56} 
          width="100%" 
          animation="wave"
          sx={{ borderRadius: '16px', bgcolor: 'white', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
        />
      </Container>
    </Box>
  );
}
