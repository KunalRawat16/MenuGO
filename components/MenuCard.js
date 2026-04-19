import { cn } from "@/lib/utils";
import { Star, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Chip,
  IconButton,
  Stack
} from "@mui/material";
import { useState } from "react";

export default function MenuCard({ item, quantity = 0, onAdd, onUpdateQuantity }) {
  const [imgSrc, setImgSrc] = useState(item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80");
  return (
    <Card 
      elevation={0}
      suppressHydrationWarning
      sx={{ 
        borderRadius: 4, 
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'transparent',
        display: 'flex',
        flexDirection: 'row',
        py: 3,
        px: 2,
        gap: 2,
        overflow: 'visible',
        transition: 'all 0.2s ease',
        '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' },
        ...(!item.isAvailable && { opacity: 0.6, filter: 'grayscale(1)' })
      }}
    >
      {/* Content Section (Left) */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          {/* Veg/Non-veg Indicator */}
          <Box sx={{ 
            w: 16, h: 16, 
            border: '1px solid', 
            borderColor: item.isVeg ? '#22c55e' : '#ef4444',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Box sx={{ w: 8, h: 8, borderRadius: '50%', bgcolor: item.isVeg ? '#22c55e' : '#ef4444' }} />
          </Box>
          {item.isPopular && (
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#f97316', fontSize: '0.65rem' }}>
              ⭐ BESTSELLER
            </Typography>
          )}
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1c1c1c', mb: 0.5 }}>
          {item.name}
        </Typography>

        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1c1c1c', fontSize: '0.95rem', mb: 1 }}>
          ₹{item.price}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.825rem', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>
          {item.description}
        </Typography>
      </Box>

      {/* Image Section (Right) */}
      <Box sx={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
        <Box sx={{ width: '100%', height: '100%', borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'rgba(0,0,0,0.05)' }}>
          <Image 
            src={imgSrc} 
            alt={item.name} 
            fill
            sizes="120px"
            className="object-cover"
            onError={() => setImgSrc("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80")}
          />
        </Box>

        {/* Floating ADD Button */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: -12, 
          left: '50%', 
          transform: 'translateX(-50%)',
          width: '80%',
          zIndex: 2
        }}>
          {item.isAvailable ? (
            quantity > 0 ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                bgcolor: 'white',
                borderRadius: 2,
                border: '1px solid',
                borderColor: '#22c55e',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                p: 0.5,
                height: 36
              }}>
                <IconButton size="small" sx={{ p: 0.5, color: '#22c55e' }} onClick={() => onUpdateQuantity(item.id, quantity - 1)}>
                  <Minus size={16} strokeWidth={3} />
                </IconButton>
                <Typography sx={{ fontWeight: 800, color: '#22c55e', fontSize: '0.875rem' }}>{quantity}</Typography>
                <IconButton size="small" sx={{ p: 0.5, color: '#22c55e' }} onClick={() => onUpdateQuantity(item.id, quantity + 1)}>
                  <Plus size={16} strokeWidth={3} />
                </IconButton>
              </Box>
            ) : (
              <Button 
                variant="contained" 
                fullWidth
                onClick={() => onAdd(item)}
                sx={{ 
                  bgcolor: 'white', 
                  color: '#22c55e',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  height: 36,
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: '#f8f8f8', borderColor: '#22c55e' }
                }}
              >
                ADD
              </Button>
            )
          ) : (
            <Box sx={{ 
              bgcolor: 'rgba(255,255,255,0.9)', 
              color: 'text.secondary',
              fontWeight: 800,
              fontSize: '0.65rem',
              height: 32,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              OUT OF STOCK
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
}
