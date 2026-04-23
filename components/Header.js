'use client';

import {
  Star,
  Clock,
  IndianRupee,
  Search as SearchIcon,
  X,
  Trophy,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow
} from "lucide-react";
import Image from "next/image";
import {
  Box,
  Typography,
  Container,
  TextField,
  InputAdornment,
  IconButton,
  Drawer,
  Stack,
  Button
} from "@mui/material";
import { useState } from "react";

export default function Header({
  restaurant,
  searchQuery,
  setSearchQuery,
  vegOnly,
  setVegOnly,
  nonVegOnly,
  setNonVegOnly,
  sortBy,
  setSortBy
}) {
  const [bannerSrc, setBannerSrc] = useState(restaurant.banner || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const BRAND_COLOR = "#22c55e"; // Standard Emerald Green

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
    setDrawerOpen(open);
  };

  const FilterTag = ({ label, icon: Icon, active, onClick, activeColor = BRAND_COLOR }) => (
    <Box
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1.2,
        borderRadius: '14px',
        border: '1px solid',
        borderColor: active ? (activeColor === BRAND_COLOR ? '#86efac' : '#fca5a5') : 'rgba(0,0,0,0.08)',
        bgcolor: active ? (activeColor === BRAND_COLOR ? '#f0fdf4' : '#fef2f2') : 'white',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: active ? `0 4px 12px ${activeColor}15` : '0 2px 4px rgba(0,0,0,0.02)',
        '&:hover': { bgcolor: active ? (activeColor === BRAND_COLOR ? '#f0fdf4' : '#fef2f2') : '#f8fafc' }
      }}
    >
      {Icon && <Icon size={16} color={active ? activeColor : "#64748b"} />}
      <Typography variant="body2" sx={{
        fontWeight: 700,
        color: active ? activeColor : "#1e293b",
        fontSize: '0.85rem'
      }}>
        {label}
      </Typography>
      {active && <X size={14} color={activeColor} />}
    </Box>
  );

  return (
    <Box sx={{ position: 'relative', width: '100%', mb: '15px' }} suppressHydrationWarning>
      {/* Immersive Banner Section */}
      <Box sx={{
        position: 'relative',
        height: { xs: 260, md: 360 },
        width: '100%',
        overflow: 'hidden'
      }}>
        <Image
          src={bannerSrc}
          alt="Restaurant Banner"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          onError={() => setBannerSrc("https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070")}
        />
        <Box sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
        }} />

        <Box sx={{
          position: 'absolute',
          bottom: { xs: 20, md: 40 },
          left: 0,
          right: 0,
          p: { xs: 3, md: 4 },
          color: 'white'
        }} suppressHydrationWarning>
          <Container maxWidth="md">
            <Typography variant="h1" sx={{
              fontWeight: 500,
              fontSize: { xs: '2rem', md: '3.75rem' },
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              mb: 0.5,
              textShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              {restaurant.name}
            </Typography>
            <Typography variant="body1" sx={{
              fontWeight: 200,
              opacity: 0.85,
              fontSize: { xs: '0.95rem', md: '1.2rem' },
              letterSpacing: '0.01em',
              mb: 2
            }}>
              {restaurant.address}
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', opacity: 0.9 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star size={16} fill={BRAND_COLOR} color={BRAND_COLOR} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{restaurant.rating || "4.2"}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Clock size={16} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{restaurant.avgTime || "20-30 mins"}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IndianRupee size={16} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>150 per person</Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Floating Search & Filter Row */}
      <Container maxWidth="md" sx={{ mt: -4, position: 'relative', zIndex: 10, px: { xs: 2, md: 0 } }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Start typing to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                borderRadius: '12px',
                height: 54,
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                '& fieldset': { borderColor: 'transparent' },
                '&.Mui-focused fieldset': { borderColor: 'transparent' },
              }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={20} color="#94a3b8" />
                  </InputAdornment>
                ),
              }
            }}
          />
          <IconButton
            onClick={toggleDrawer(true)}
            sx={{
              bgcolor: 'white', width: 54, height: 54, borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)',
              color: drawerOpen ? BRAND_COLOR : '#1e293b',
              '&:hover': { bgcolor: '#f8fafc' }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
              <line x1="2" y1="14" x2="6" y2="14" /><line x1="10" y1="12" x2="14" y2="12" /><line x1="18" y1="16" x2="22" y2="16" />
            </svg>
          </IconButton>
        </Box>

        {/* Simplified Filter Drawer */}
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              maxHeight: '90vh',
              bgcolor: '#f8fafc'
            }
          }}
        >
          <Box sx={{ p: 4, pb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>Filters and sorting</Typography>
              <IconButton onClick={toggleDrawer(false)} sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <X size={20} />
              </IconButton>
            </Box>

            <Stack spacing={4}>
              {/* Preference Section */}
              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#1e293b' }}>Preference</Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <FilterTag
                    label="Veg Only"
                    active={vegOnly}
                    onClick={() => { setVegOnly(!vegOnly); if (!vegOnly) setNonVegOnly(false); }}
                    icon={() => (
                      <Box sx={{ width: 14, height: 14, border: '1px solid #22c55e', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e' }} />
                      </Box>
                    )}
                  />
                  <FilterTag
                    label="Non-veg Only"
                    active={nonVegOnly}
                    activeColor="#ef4444"
                    onClick={() => { setNonVegOnly(!nonVegOnly); if (!nonVegOnly) setVegOnly(false); }}
                    icon={() => (
                      <Box sx={{ width: 14, height: 14, border: '1px solid #ef4444', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ef4444' }} />
                      </Box>
                    )}
                  />
                </Box>
              </Box>

              {/* Sorting Options */}
              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#1e293b' }}>Sorting by</Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <FilterTag
                    label="Bestseller"
                    icon={Trophy}
                    active={sortBy === "popular"}
                    onClick={() => setSortBy(sortBy === "popular" ? "default" : "popular")}
                  />
                  <FilterTag
                    label="Price: Low to High"
                    icon={ArrowUpNarrowWide}
                    active={sortBy === "price_low"}
                    onClick={() => setSortBy(sortBy === "price_low" ? "default" : "price_low")}
                  />
                  <FilterTag
                    label="Price: High to Low"
                    icon={ArrowDownWideNarrow}
                    active={sortBy === "price_high"}
                    onClick={() => setSortBy(sortBy === "price_high" ? "default" : "price_high")}
                  />
                </Box>
              </Box>
            </Stack>

            <Box sx={{ mt: 5 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={toggleDrawer(false)}
                sx={{
                  bgcolor: BRAND_COLOR,
                  color: 'white',
                  borderRadius: '16px',
                  py: 2,
                  fontWeight: 900,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#16a34a' }
                }}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
        </Drawer>
      </Container>
    </Box>
  );
}
