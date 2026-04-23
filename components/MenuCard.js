import { cn } from "@/lib/utils";
import { Star, Plus, Minus, Clock, Flame, Info } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip
} from "@mui/material";
import { useState } from "react";

export default function MenuCard({ item, quantity = 0, onAdd, onUpdateQuantity, hidePopular = false }) {
  const [imgSrc, setImgSrc] = useState(item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80");
  const isSpicy = item.description?.toLowerCase().includes('spicy') || item.description?.toLowerCase().includes('chili');

  return (
    <Card
      elevation={0}
      suppressHydrationWarning={true}
      sx={{
        borderRadius: '20px',
        border: '1px solid',
        mb: '10px',
        borderColor: 'rgba(0,0,0,0.08)',
        bgcolor: 'white',
        display: 'flex',
        flexDirection: 'row',
        p: 0, 
        gap: 0, 
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.08)' },
        ...(!item.isAvailable && { opacity: 0.6, filter: 'grayscale(1)' })
      }}
    >
      {/* Image Section (Left) - Flush with borders */}
      <Box suppressHydrationWarning={true} sx={{ position: 'relative', width: { xs: 110, md: 150 }, minHeight: '100%', flexShrink: 0 }}>
        <Image
          src={imgSrc}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 110px, 150px"
          quality={75}
          className="object-cover"
          onError={() => setImgSrc("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80")}
        />

        {/* Popular Tag (Overlay) */}
        {item.isPopular && !hidePopular && (
          <Box sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'rgba(255,255,255,0.95)',
            color: '#f97316',
            px: 1,
            py: 0.3,
            borderRadius: '6px',
            fontSize: '0.6rem',
            fontWeight: 900,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            zIndex: 1
          }}>
            <Star size={10} fill="currentColor" /> POPULAR
          </Box>
        )}
      </Box>

      {/* Content Section (Right) */}
      <Box suppressHydrationWarning={true} sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1.2rem' }, color: '#1a202c', lineHeight: 1.2 }}>
                {item.name}
              </Typography>
              {isSpicy && <Flame size={14} color="#ef4444" fill="#ef4444" />}
            </Box>

            {/* Veg/Non-veg Indicator */}
            <Box sx={{
              width: 16, height: 16,
              border: '1px solid',
              borderColor: item.isVeg ? '#22c55e' : '#ef4444',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              mt: 0.3,
              ml: 1
            }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.isVeg ? '#22c55e' : '#ef4444' }} />
            </Box>
          </Box>

          <Typography variant="body2" sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', md: '0.875rem' },
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
            mb: 1
          }}>
            {item.description}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, opacity: 0.7 }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Clock size={12} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>15-20m</Typography>
             </Box>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Info size={12} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Details</Typography>
             </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 1 }}>
          <Typography sx={{ fontWeight: 900, color: '#1a202c', fontSize: { xs: '1rem', md: '1.15rem' } }}>
            ₹{item.price}
          </Typography>

          <Box>
            {item.isAvailable ? (
              quantity > 0 ? (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: '#f8fafc',
                  borderRadius: '12px',
                  p: 0.5,
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.05)'
                }}>
                  <IconButton
                    size="small"
                    sx={{ bgcolor: 'white', color: '#22c55e', p: 0.5, '&:hover': { bgcolor: '#f0fdf4' } }}
                    onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                  >
                    <Minus size={14} strokeWidth={4} />
                  </IconButton>
                  <Typography sx={{ fontWeight: 900, color: '#1a202c', fontSize: '0.9rem', minWidth: 12, textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ bgcolor: '#22c55e', color: 'white', p: 0.5, '&:hover': { bgcolor: '#16a34a' } }}
                    onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                  >
                    <Plus size={14} strokeWidth={4} />
                  </IconButton>
                </Box>
              ) : (
                <IconButton
                  onClick={() => onAdd(item)}
                  sx={{
                    bgcolor: '#22c55e',
                    color: 'white',
                    borderRadius: '10px',
                    width: 38,
                    height: 38,
                    '&:hover': { bgcolor: '#16a34a' },
                    boxShadow: '0 4px 10px rgba(34, 197, 94, 0.2)'
                  }}
                >
                  <Plus size={22} strokeWidth={3} />
                </IconButton>
              )
            ) : (
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', letterSpacing: '0.05em' }}>
                SOLD OUT
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
