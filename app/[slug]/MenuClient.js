"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import CategoryTabs from "@/components/CategoryTabs";
import MenuCard from "@/components/MenuCard";
import CartDrawer from "@/components/CartDrawer";
import { Search as SearchIcon, ShoppingBag } from "lucide-react";
import { 
  Box, 
  TextField, 
  InputAdornment, 
  FormControlLabel, 
  Checkbox, 
  Select, 
  MenuItem, 
  Typography,
  Container,
  Fab,
  Badge,
  Snackbar,
  Alert,
  Paper
} from "@mui/material";

export default function MenuClient({ restaurant }) {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  
  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // Order Tracking State
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    setMounted(true);
    // Load cart and active order from localStorage
    const savedCart = localStorage.getItem(`cart_${restaurant.slug}`);
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) {}
    }
    const savedOrderId = localStorage.getItem(`activeOrder_${restaurant.slug}`);
    if (savedOrderId) {
      setActiveOrder({ _id: savedOrderId, status: "Pending" });
    }
  }, [restaurant.slug]);

  // Poll for order status
  useEffect(() => {
    if (!activeOrder?._id) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/orders`);
        const data = await res.json();
        if (data.success) {
          const myOrder = data.orders.find(o => o._id === activeOrder._id);
          if (myOrder) {
            setActiveOrder(myOrder);
            // If order status just changed to Completed, start the disappearance timer
            if (myOrder.status === 'Completed' && activeOrder.status !== 'Completed') {
              setTimeout(() => {
                setActiveOrder(null);
                localStorage.removeItem(`activeOrder_${restaurant.slug}`);
              }, 5000);
            }
          } else if (activeOrder.status === 'Served' || activeOrder.status === 'Completed') {
            // Order was deleted after being served or completed
            setActiveOrder({ ...activeOrder, status: 'Completed' });
            setTimeout(() => {
              setActiveOrder(null);
              localStorage.removeItem(`activeOrder_${restaurant.slug}`);
            }, 5000);
          } else {
            // Order not found (cancelled or error)
            setActiveOrder(null);
            localStorage.removeItem(`activeOrder_${restaurant.slug}`);
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    checkStatus(); // Initial check
    return () => clearInterval(interval);
  }, [activeOrder?._id, activeOrder?.status, restaurant.slug]);

  const addToCart = (item) => {
    setCart(prev => [...prev, { ...item, quantity: 1 }]);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(i => i.id !== itemId));
    } else {
      setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i));
    }
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const handlePlaceOrder = async (customerDetails) => {
    try {
      const orderData = {
        restaurantId: restaurant._id,
        restaurantSlug: restaurant.slug,
        items: cart,
        totalPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        ...customerDetails,
        status: "Pending"
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCart([]);
        setIsCartOpen(false);
        setOrderSuccess(true);
        setActiveOrder(data.order);
        localStorage.setItem(`activeOrder_${restaurant.slug}`, data.order._id);
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Order error", error);
      alert("Something went wrong.");
    }
  };

  const filteredItems = restaurant.menuItems.filter((item) => {
    if (activeCategory !== "All" && item.category !== activeCategory) return false;
    if (vegOnly && !item.isVeg) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const sortedAndFilteredItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "price_low") return a.price - b.price;
    if (sortBy === "price_high") return b.price - a.price;
    if (sortBy === "popular") return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    return 0;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(`cart_${restaurant.slug}`, JSON.stringify(cart));
    }
  }, [cart, mounted, restaurant.slug]);

  if (!mounted) {
    return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }} suppressHydrationWarning />;
  }

  return (
    <Box sx={{ pb: activeOrder ? 20 : 12 }} suppressHydrationWarning>
      <Header restaurant={restaurant} />
      
      {/* Premium Order Status Bar (Option 3: Premium Floating) */}
      {activeOrder && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: cartCount > 0 ? 110 : 30, 
          left: '50%', 
          transform: 'translateX(-50%)',
          width: '94%',
          maxWidth: 440,
          zIndex: 1000,
          animation: 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2.5, 
              borderRadius: '28px', 
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Ambient Background Glow */}
            <Box sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, rgba(255,255,255,0) 70%)',
              pointerEvents: 'none'
            }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ 
                width: 58, 
                height: 58, 
                borderRadius: '20px', 
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <Typography variant="h4" sx={{ 
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                  animation: activeOrder.status === 'Preparing' ? 'cookingShake 2s infinite ease-in-out' : 'none'
                }}>
                  {activeOrder.status === 'Pending' && "⏳"}
                  {activeOrder.status === 'Preparing' && "🍳"}
                  {activeOrder.status === 'Served' && "🍲"}
                  {activeOrder.status === 'Completed' && "✨"}
                </Typography>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ 
                  fontWeight: 900, 
                  textTransform: 'uppercase', 
                  color: 'green.600',
                  bgcolor: 'green.50',
                  px: 1.5,
                  py: 0.4,
                  borderRadius: '8px',
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  display: 'inline-block',
                  mb: 0.8
                }}>
                  Order #{activeOrder._id.slice(-4).toUpperCase()}
                </Typography>
                
                <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1, fontSize: '1.15rem', color: '#1a202c' }}>
                  {activeOrder.status === 'Pending' && "Receiving Order..."}
                  {activeOrder.status === 'Preparing' && "Chef is cooking..."}
                  {activeOrder.status === 'Served' && "It's on your table!"}
                  {activeOrder.status === 'Completed' && "Payment Confirmed!"}
                </Typography>
                
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mt: 0.5, fontSize: '0.85rem' }}>
                  {activeOrder.status === 'Pending' && "Waiting for confirmation"}
                  {activeOrder.status === 'Preparing' && "Preparing your delicious meal"}
                  {activeOrder.status === 'Served' && "Enjoy your food!"}
                  {activeOrder.status === 'Completed' && "Thank you for dining with us!"}
                </Typography>
              </Box>

              {activeOrder.status === 'Preparing' && (
                <Box sx={{ 
                  px: 1.5, py: 0.8, bgcolor: 'orange.50', borderRadius: '12px', color: 'orange.700',
                  fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02em',
                  border: '1px solid rgba(251, 146, 60, 0.2)'
                }}>
                  Live
                </Box>
              )}
            </Box>

            {/* Glowing Progress Bar (Option 3 Style) */}
            {activeOrder.status !== 'Completed' && (
              <Box sx={{ px: 0.5 }}>
                <Box sx={{ 
                  width: '100%', 
                  height: 8, 
                  bgcolor: '#f1f5f9', 
                  borderRadius: 4, 
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid rgba(0,0,0,0.03)'
                }}>
                  <Box sx={{ 
                    height: '100%', 
                    bgcolor: '#22c55e', 
                    borderRadius: 4,
                    transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    width: 
                      activeOrder.status === 'Pending' ? '20%' : 
                      activeOrder.status === 'Preparing' ? '65%' : 
                      activeOrder.status === 'Served' ? '100%' : '0%',
                    boxShadow: '0 0 15px rgba(34, 197, 94, 0.5)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
                      animation: 'shimmer 2s infinite'
                    }
                  }} />
                </Box>
              </Box>
            )}

            <style jsx global>{`
              @keyframes slideUp {
                from { transform: translate(-50%, 100%); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
              }
              @keyframes shimmer {
                from { transform: translateX(-100%); }
                to { transform: translateX(100%); }
              }
              @keyframes cookingShake {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-10deg); }
                75% { transform: rotate(10deg); }
              }
            `}</style>
          </Paper>
        </Box>
      )}

      {/* Sticky Filters & Tabs Container */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 10, 
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
      }} suppressHydrationWarning>
        <Container maxWidth="md" sx={{ py: 2 }} suppressHydrationWarning>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 2,
            alignItems: 'center'
          }} suppressHydrationWarning>
            <TextField
              fullWidth
              size="small"
              placeholder="Search your cravings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon size={18} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3, bgcolor: 'background.default' }
                }
              }}
              suppressHydrationWarning
            />
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              width: { xs: '100%', md: 'auto' },
              gap: 2
            }} suppressHydrationWarning>
              <FormControlLabel
                control={
                  <Checkbox 
                    size="small"
                    color="success"
                    checked={vegOnly} 
                    onChange={(e) => setVegOnly(e.target.checked)} 
                  />
                }
                label={<Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Veg Only</Typography>}
              />
              
              <Select
                size="small"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ 
                  minWidth: { xs: 150, md: 180 }, 
                  borderRadius: 2,
                  bgcolor: 'background.default',
                  '& .MuiSelect-select': { py: 1, fontSize: '0.875rem', fontWeight: 600 }
                }}
                suppressHydrationWarning
              >
                <MenuItem value="default">Sort: Default</MenuItem>
                <MenuItem value="popular">Sort: Popular</MenuItem>
                <MenuItem value="price_low">Price: Low to High</MenuItem>
                <MenuItem value="price_high">Price: High to Low</MenuItem>
              </Select>
            </Box>
          </Box>
        </Container>

        <CategoryTabs 
          categories={restaurant.categories} 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
        />
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }} suppressHydrationWarning>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} suppressHydrationWarning>
          {sortedAndFilteredItems.length > 0 ? (
            sortedAndFilteredItems.map((item) => (
              <MenuCard 
                key={item.id} 
                item={item} 
                quantity={cart.find(i => i.id === item.id)?.quantity || 0}
                onAdd={addToCart}
                onUpdateQuantity={updateQuantity}
              />
            ))
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8, 
              px: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 4, 
              border: 1, 
              borderColor: 'divider' 
            }} suppressHydrationWarning>
              <Typography variant="h3" sx={{ mb: 2, opacity: 0.5 }}>🍽️</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>No items found</Typography>
              <Typography variant="body2" color="text.secondary">
                Try changing your category or search filters
              </Typography>
            </Box>
          )}
        </Box>
      </Container>

      {/* Floating View Cart Bar (Zomato Style) */}
      {cartCount > 0 && (
        <Box 
          onClick={() => setIsCartOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '92%',
            maxWidth: 420,
            bgcolor: '#22c55e',
            color: 'white',
            borderRadius: 3,
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 1100,
            boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.4)',
            transition: 'all 0.2s ease',
            '&:active': { transform: 'translateX(-50%) scale(0.98)' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              px: 1, 
              py: 0.5, 
              borderRadius: 1, 
              fontSize: '0.75rem', 
              fontWeight: 900 
            }}>
              {cartCount} ITEM{cartCount > 1 ? 'S' : ''}
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>
              View Cart
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>
            ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
            <Box component="span" sx={{ ml: 1, opacity: 0.8 }}>→</Box>
          </Typography>
        </Box>
      )}

      <CartDrawer 
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onPlaceOrder={handlePlaceOrder}
        restaurantName={restaurant.name}
      />

      <Snackbar 
        open={orderSuccess} 
        autoHideDuration={6000} 
        onClose={() => setOrderSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%', fontWeight: 700, borderRadius: 3 }}>
          Order placed successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
