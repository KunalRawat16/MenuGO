'use client';

import { Box, Container, Stack } from '@mui/material';
import HeaderSkeleton from '@/components/Skeleton/HeaderSkeleton';
import MenuCardSkeleton from '@/components/Skeleton/MenuCardSkeleton';

export default function Loading() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 10 }}>
      {/* Immersive Header Loading */}
      <HeaderSkeleton />

      {/* Category Tabs Loading */}
      <Container maxWidth="md" sx={{ mt: 3, mb: 4 }}>
        <Stack direction="row" spacing={2} sx={{ overflow: 'hidden' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Box 
              key={i} 
              sx={{ 
                minWidth: 80, 
                height: 40, 
                bgcolor: 'white', 
                borderRadius: '12px', 
                border: '1px solid rgba(0,0,0,0.05)' 
              }} 
            />
          ))}
        </Stack>
      </Container>

      {/* Menu Items List Loading */}
      <Container maxWidth="md">
        <Stack spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <MenuCardSkeleton key={i} />
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
