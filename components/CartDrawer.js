"use client";

import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  Divider, 
  TextField,
  Stack
} from "@mui/material";
import { X, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";

export default function CartDrawer({ 
  open, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onRemove,
  onPlaceOrder,
  restaurantName
}) {
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async () => {
    if (!customerName || !tableNumber) {
      alert("Please enter your name and table number");
      return;
    }
    setIsSubmitting(true);
    await onPlaceOrder({ customerName, tableNumber });
    setIsSubmitting(false);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: { xs: '100%', sm: 400 }, borderRadius: { xs: 0, sm: '20px 0 0 20px' } }
        }
      }}
    >
      <Box sx={{ h: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Your Cart</Typography>
          <IconButton onClick={onClose}><X size={24} /></IconButton>
        </Box>

        {cart.length === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
            <ShoppingCart size={64} strokeWidth={1} />
            <Typography sx={{ mt: 2, fontWeight: 600 }}>Your cart is empty</Typography>
          </Box>
        ) : (
          <>
            <List sx={{ flex: 1, overflowY: 'auto' }}>
              {cart.map((item) => (
                <ListItem key={item.id} sx={{ px: 0, py: 2 }}>
                  <Box sx={{ w: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">₹{item.price} each</Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>₹{item.price * item.quantity}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', bgcolor: 'background.default', borderRadius: 2, p: 0.5 }}>
                        <IconButton size="small" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                          <Minus size={16} />
                        </IconButton>
                        <Typography sx={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                          <Plus size={16} />
                        </IconButton>
                      </Stack>
                      <IconButton size="small" color="error" onClick={() => onRemove(item.id)}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2} sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                Total <span>₹{total}</span>
              </Typography>
              <TextField 
                label="Your Name" 
                fullWidth 
                size="small"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <TextField 
                label="Table Number" 
                fullWidth 
                size="small"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </Stack>

            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              disabled={isSubmitting}
              onClick={handleSubmit}
              sx={{ 
                py: 2, 
                borderRadius: 3, 
                fontWeight: 800, 
                fontSize: '1rem',
                boxShadow: '0 8px 16px -4px rgb(249 115 22 / 0.4)'
              }}
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </Button>
          </>
        )}
      </Box>
    </Drawer>
  );
}
