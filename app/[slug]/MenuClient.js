'use client';

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import CategoryTabs from "@/components/CategoryTabs";
import MenuCard from "@/components/MenuCard";

const CartDrawer = dynamic(() => import("@/components/CartDrawer"), {
  ssr: false,
  loading: () => null
});
import { 
  ShoppingBag, 
  ChevronRight, 
  Utensils, 
  Coffee, 
  Pizza, 
  IceCream, 
  Soup, 
  Salad, 
  Beef, 
  Cake,
  GlassWater
} from "lucide-react";
import {
  Box,
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
  const [nonVegOnly, setNonVegOnly] = useState(false);
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
    const savedCart = localStorage.getItem(`cart_${restaurant.slug}`);
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { }
    }
    const savedOrderId = localStorage.getItem(`activeOrder_${restaurant.slug}`);
    if (savedOrderId) {
      setActiveOrder({ _id: savedOrderId, status: "Pending" });
    }
  }, [restaurant.slug]);

  useEffect(() => {
    if (!activeOrder?._id) return;
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/orders`);
        const data = await res.json();
        if (data.success) {
          const myOrder = data.orders.find(o => o._id === activeOrder._id);
          if (myOrder) {
            if (myOrder.status !== activeOrder.status) {
              setActiveOrder(myOrder);
              if (myOrder.status === 'Completed') {
                setTimeout(() => {
                  setActiveOrder(null);
                  localStorage.removeItem(`activeOrder_${restaurant.slug}`);
                }, 5000);
              }
            }
          } else {
            setActiveOrder(null);
            localStorage.removeItem(`activeOrder_${restaurant.slug}`);
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    };
    const interval = setInterval(checkStatus, 8000);
    checkStatus();
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

  const filteredItems = useMemo(() => {
    return restaurant.menuItems.filter((item) => {
      if (activeCategory !== "All" && item.category !== activeCategory) return false;
      if (vegOnly && !item.isVeg) return false;
      if (nonVegOnly && item.isVeg) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [restaurant.menuItems, activeCategory, vegOnly, nonVegOnly, searchQuery]);

  const sortedAndFilteredItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "popular") return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      return 0;
    });
  }, [filteredItems, sortBy]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(`cart_${restaurant.slug}`, JSON.stringify(cart));
    }
  }, [cart, mounted, restaurant.slug]);

  const categories = activeCategory === "All" 
    ? [...new Set(restaurant.menuItems.map(item => item.category))]
    : [activeCategory];

  // Icon Helper for Categories
  const getCategoryIcon = (cat) => {
    const c = cat.toLowerCase();
    if (c.includes('appetizer') || c.includes('starter')) return <Soup size={20} color="#22c55e" />;
    if (c.includes('main')) return <Utensils size={20} color="#22c55e" />;
    if (c.includes('pizza') || c.includes('bread')) return <Pizza size={20} color="#22c55e" />;
    if (c.includes('salad')) return <Salad size={20} color="#22c55e" />;
    if (c.includes('meat') || c.includes('non')) return <Beef size={20} color="#22c55e" />;
    if (c.includes('dessert') || c.includes('sweet')) return <Cake size={20} color="#22c55e" />;
    if (c.includes('beverage') || c.includes('drink')) return <GlassWater size={20} color="#22c55e" />;
    if (c.includes('coffee')) return <Coffee size={20} color="#22c55e" />;
    return <Pizza size={20} color="#22c55e" />;
  };

  return (
    <Box sx={{ pb: activeOrder ? 24 : 16, bgcolor: '#ffffff' }} suppressHydrationWarning>
      <Header 
        restaurant={restaurant} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        vegOnly={vegOnly}
        setVegOnly={setVegOnly}
        nonVegOnly={nonVegOnly}
        setNonVegOnly={setNonVegOnly}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: 'rgba(0,0,0,0.06)',
      }} suppressHydrationWarning>
        <CategoryTabs
          categories={restaurant.categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </Box>

      {/* Premium Order Status Bar (Floating) */}
      {mounted && activeOrder && (
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
                  color: '#22c55e',
                  bgcolor: '#f0fdf4',
                  px: 1.5,
                  py: 0.4,
                  borderRadius: '8px',
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  display: 'inline-block',
                  mb: 0.8
                }}>
                  Order Tracking
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1, fontSize: '1.15rem', color: '#1a202c' }}>
                  {activeOrder.status === 'Pending' && "Chef just spotted your order! 👨‍🍳"}
                  {activeOrder.status === 'Preparing' && "Chef is cooking up a storm! 🔥"}
                  {activeOrder.status === 'Served' && "Bon Appétit! It's served 🥂"}
                  {activeOrder.status === 'Completed' && "Flavor mission complete! ✨"}
                </Typography>

                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mt: 0.5, fontSize: '0.85rem' }}>
                  {activeOrder.status === 'Pending' && "The magic is about to start."}
                  {activeOrder.status === 'Preparing' && "Your meal is reaching perfection."}
                  {activeOrder.status === 'Served' && "Time to dive into the flavors!"}
                  {activeOrder.status === 'Completed' && "Payment confirmed. See you again!"}
                </Typography>
              </Box>

              <Box sx={{
                px: 1.5, py: 0.8, bgcolor: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', color: '#16a34a',
                fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02em'
              }}>
                Live
              </Box>
            </Box>

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
                  boxShadow: '0 0 15px rgba(34, 197, 94, 0.5)'
                }} />
              </Box>
            </Box>

            <style jsx global>{`
              @keyframes slideUp {
                from { transform: translate(-50%, 100%); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
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

      <Container maxWidth="md" sx={{ mt: 4 }} suppressHydrationWarning>
        {/* Brand Story Section with refined spacing */}
        <Box sx={{ mb: 6, textAlign: 'center', px: 2 }}>
          <Typography variant="body1" sx={{ 
            color: '#64748b', 
            fontWeight: 500, 
            lineHeight: 1.8,
            fontSize: '1rem',
            fontStyle: 'italic',
            maxWidth: '600px',
            mx: 'auto'
          }}>
            "Our Chefs traveled the globe to bring the best flavours for you. Make sure you taste a bit from every course."
          </Typography>
        </Box>

        {/* Menu Items grouped by Category */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }} suppressHydrationWarning>
          {categories.map((category) => {
            const itemsInCategory = sortedAndFilteredItems.filter(item => item.category === category);
            if (itemsInCategory.length === 0) return null;

            return (
              <Box key={category} id={category} sx={{ scrollMarginTop: '100px' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 1,
                  mt: 3,
                }}>
                  {getCategoryIcon(category)}
                  <Typography variant="h5" sx={{ 
                    fontWeight: 900, 
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase'
                  }}>
                    {category}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {itemsInCategory.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      quantity={cart.find(i => i.id === item.id)?.quantity || 0}
                      onAdd={addToCart}
                      onUpdateQuantity={updateQuantity}
                    />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Container>

      {/* Floating Action Elements (Cart & Status) */}
      {mounted && cartCount > 0 && (
        <Fab
          variant="extended"
          onClick={() => setIsCartOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 30,
            right: 30,
            bgcolor: '#22c55e',
            color: 'white',
            px: 3,
            '&:hover': { bgcolor: '#16a34a' },
            boxShadow: '0 12px 24px rgba(34, 197, 94, 0.3)',
            zIndex: 1000,
            textTransform: 'none',
            fontWeight: 900,
            fontSize: '1rem',
            gap: 1.5
          }}
        >
          <Badge badgeContent={cartCount} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 900 } }}>
            <ShoppingBag size={22} />
          </Badge>
          View Cart
        </Fab>
      )}

      {mounted && (
        <CartDrawer
          open={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onPlaceOrder={handlePlaceOrder}
          restaurantName={restaurant.name}
        />
      )}

      <Snackbar 
        open={orderSuccess} 
        autoHideDuration={6000} 
        onClose={() => setOrderSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ borderRadius: '16px', fontWeight: 700 }}>
          Order placed successfully! Tracking is active.
        </Alert>
      </Snackbar>
    </Box>
  );
}
