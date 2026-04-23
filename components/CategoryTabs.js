'use client';

import { Tabs, Tab, Box, Container } from "@mui/material";

export default function CategoryTabs({ categories, activeCategory, setActiveCategory }) {
  const allCategories = ["All", ...categories];

  const handleChange = (event, newValue) => {
    setActiveCategory(newValue);
  };

  const BRAND_COLOR = "#22c55e"; // Emerald Green

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'rgba(0,0,0,0.06)',
      }}
      suppressHydrationWarning
    >
      <Container maxWidth="md" suppressHydrationWarning>
        <Tabs
          value={activeCategory}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: BRAND_COLOR, // Brand Emerald Green
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTabs-flexContainer': {
              gap: 4
            }
          }}
          suppressHydrationWarning
        >
          {allCategories.map((category) => (
            <Tab
              key={category}
              value={category}
              label={category}
              sx={{
                textTransform: 'none',
                fontWeight: 900,
                fontSize: { xs: '1rem', md: '1.2rem' },
                color: '#64748b',
                px: 2,
                minWidth: 'auto',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  color: '#0f172a'
                },
                '&:hover': {
                  color: '#0f172a',
                  opacity: 0.8
                }
              }}
              suppressHydrationWarning
            />
          ))}
        </Tabs>
      </Container>
    </Box>
  );
}
