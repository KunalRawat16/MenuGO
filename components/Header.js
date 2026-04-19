import { MapPin } from "lucide-react";
import Image from "next/image";
import { Box, Typography, Container } from "@mui/material";
import { useState } from "react";

export default function Header({ restaurant }) {
  const [bannerSrc, setBannerSrc] = useState(restaurant.banner || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070");
  const [logoSrc, setLogoSrc] = useState(restaurant.logo || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&q=80");

  return (
    <Box sx={{ bgcolor: 'background.paper' }} suppressHydrationWarning>
      {/* Banner Section */}
      <Box sx={{ position: 'relative', height: { xs: 240, md: 320 }, width: '100%', overflow: 'hidden' }} suppressHydrationWarning>
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
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' 
        }} />
        
        {/* Restaurant Info Overlay */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 3, color: 'white' }} suppressHydrationWarning>
          <Container maxWidth="md">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 3 } }} suppressHydrationWarning>
              <Box sx={{ position: 'relative', width: { xs: 64, md: 80 }, height: { xs: 64, md: 80 }, flexShrink: 0 }} suppressHydrationWarning>
                <Image 
                  src={logoSrc} 
                  alt={restaurant.name}
                  fill
                  sizes="(max-width: 900px) 64px, 80px"
                  className="rounded-full border-2 border-white shadow-xl object-cover bg-white"
                  onError={() => setLogoSrc("https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&q=80")}
                />
              </Box>
              <Box sx={{ flex: 1 }} suppressHydrationWarning>
                <Typography variant="h4" sx={{ fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.3)', fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' } }}>
                  {restaurant.name}
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 0.5, fontWeight: 700, opacity: 0.9, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                  <MapPin size={16} style={{ marginRight: 6 }} />
                  {restaurant.address}
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Quick Info Bar */}
      <Container maxWidth="md" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: { xs: 3, md: 6 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>Rating</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#22c55e', fontSize: { xs: '0.875rem', md: '1rem' } }}>
              ⭐ {restaurant.rating || "4.2"} ({restaurant.ratingCount || "100"}+)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>Time</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, fontSize: { xs: '0.875rem', md: '1rem' } }}>{restaurant.avgTime || "20-30 mins"}</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>Cost</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, fontSize: { xs: '0.875rem', md: '1rem' } }}>₹{restaurant.costForOne || "200"} for one</Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
