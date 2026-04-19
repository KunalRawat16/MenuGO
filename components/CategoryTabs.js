"use client";

import { cn } from "@/lib/utils";
import { Tabs, Tab, Box, Container } from "@mui/material";

export default function CategoryTabs({ categories, activeCategory, setActiveCategory }) {
  const handleChange = (event, newValue) => {
    setActiveCategory(newValue);
  };

  return (
    <Box 
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="md">
        <Box 
          sx={{ 
            py: 2,
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            '::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
        >
          <Box 
            onClick={() => setActiveCategory("All")}
            sx={{ 
              px: 2.5, 
              py: 1, 
              borderRadius: 10, 
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
              bgcolor: activeCategory === "All" ? '#1c1c1c' : '#f8f8f8',
              color: activeCategory === "All" ? 'white' : '#1c1c1c',
              border: '1px solid',
              borderColor: activeCategory === "All" ? '#1c1c1c' : 'rgba(0,0,0,0.05)',
              boxShadow: activeCategory === "All" ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              '&:hover': { bgcolor: activeCategory === "All" ? '#1c1c1c' : '#f0f0f0' }
            }}
          >
            All
          </Box>
          {categories.map((category) => (
            <Box 
              key={category}
              onClick={() => setActiveCategory(category)}
              sx={{ 
                px: 2.5, 
                py: 1, 
                borderRadius: 10, 
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.85rem',
                transition: 'all 0.2s ease',
                bgcolor: activeCategory === category ? '#1c1c1c' : '#f8f8f8',
                color: activeCategory === category ? 'white' : '#1c1c1c',
                border: '1px solid',
                borderColor: activeCategory === category ? '#1c1c1c' : 'rgba(0,0,0,0.05)',
                boxShadow: activeCategory === category ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                '&:hover': { bgcolor: activeCategory === category ? '#1c1c1c' : '#f0f0f0' }
              }}
            >
              {category}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
