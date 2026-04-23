'use client';

import { Box, Card, Skeleton, Stack } from '@mui/material';

export default function MenuCardSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '20px',
        border: '1px solid rgba(0,0,0,0.05)',
        mb: '10px',
        display: 'flex',
        flexDirection: 'row',
        p: 0,
        overflow: 'hidden'
      }}
    >
      {/* Image Skeleton */}
      <Skeleton 
        variant="rectangular" 
        width={110} 
        height={130} 
        animation="wave"
        sx={{ flexShrink: 0, bgcolor: 'rgba(0,0,0,0.04)' }} 
      />

      {/* Content Skeleton */}
      <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Skeleton variant="text" width="60%" height={24} animation="wave" />
            <Skeleton variant="circular" width={20} height={20} animation="wave" />
          </Box>
          <Skeleton variant="text" width="40%" height={20} animation="wave" />
          <Skeleton variant="text" width="90%" height={40} animation="wave" />
        </Stack>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Skeleton variant="text" width="30%" height={28} animation="wave" />
          <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: '8px' }} animation="wave" />
        </Box>
      </Box>
    </Card>
  );
}
