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
  Utensils, 
  Coffee, 
  Pizza, 
  Soup, 
  Salad, 
  Beef, 
  Cake,
  GlassWater,
  CheckCircle2
} from "lucide-react";

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
      try { setCart(JSON.parse(savedCart)); } catch { }
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
        setTimeout(() => setOrderSuccess(false), 6000);
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
    if (c.includes('appetizer') || c.includes('starter')) return <Soup size={20} className="text-green-500" />;
    if (c.includes('main')) return <Utensils size={20} className="text-green-500" />;
    if (c.includes('pizza') || c.includes('bread')) return <Pizza size={20} className="text-green-500" />;
    if (c.includes('salad')) return <Salad size={20} className="text-green-500" />;
    if (c.includes('meat') || c.includes('non')) return <Beef size={20} className="text-green-500" />;
    if (c.includes('dessert') || c.includes('sweet')) return <Cake size={20} className="text-green-500" />;
    if (c.includes('beverage') || c.includes('drink')) return <GlassWater size={20} className="text-green-500" />;
    if (c.includes('coffee')) return <Coffee size={20} className="text-green-500" />;
    return <Pizza size={20} className="text-green-500" />;
  };

  return (
    <div className={`bg-white min-h-screen ${activeOrder ? 'pb-60' : 'pb-40'}`} suppressHydrationWarning>
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

      <div className="sticky top-0 z-[30] bg-white/95 backdrop-blur-md" suppressHydrationWarning>
        <CategoryTabs
          categories={restaurant.categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </div>

      {/* Premium Order Status Bar (Floating) */}
      {mounted && activeOrder && (
        <div className={`fixed left-1/2 -translate-x-1/2 w-[94%] max-w-md z-[90] transition-all duration-500 ease-out ${cartCount > 0 ? 'bottom-[110px]' : 'bottom-[30px]'}`}>
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] rounded-[28px] p-5 flex flex-col gap-5 overflow-hidden relative">
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center flex-shrink-0 shadow-inner border border-gray-100">
                <span className={`text-2xl ${activeOrder.status === 'Preparing' ? 'animate-bounce' : ''}`}>
                  {activeOrder.status === 'Pending' && "⏳"}
                  {activeOrder.status === 'Preparing' && "🍳"}
                  {activeOrder.status === 'Served' && "🍲"}
                  {activeOrder.status === 'Completed' && "✨"}
                </span>
              </div>

              <div className="flex-1">
                <span className="inline-block bg-green-50 text-green-600 font-black uppercase text-[0.65rem] tracking-widest px-2 py-1 rounded-lg mb-1.5">
                  Order Tracking
                </span>

                <h3 className="font-black text-gray-900 leading-tight text-[1.15rem]">
                  {activeOrder.status === 'Pending' && "Chef just spotted your order! 👨‍🍳"}
                  {activeOrder.status === 'Preparing' && "Chef is cooking up a storm! 🔥"}
                  {activeOrder.status === 'Served' && "Bon Appétit! It's served 🥂"}
                  {activeOrder.status === 'Completed' && "Flavor mission complete! ✨"}
                </h3>

                <p className="font-bold text-gray-500 text-[0.85rem] mt-1">
                  {activeOrder.status === 'Pending' && "The magic is about to start."}
                  {activeOrder.status === 'Preparing' && "Your meal is reaching perfection."}
                  {activeOrder.status === 'Served' && "Time to dive into the flavors!"}
                  {activeOrder.status === 'Completed' && "Payment confirmed. See you again!"}
                </p>
              </div>

              <div className="px-2.5 py-1.5 bg-green-50 text-green-600 rounded-xl text-[0.7rem] font-black uppercase tracking-widest self-start">
                Live
              </div>
            </div>

            <div className="px-1 relative z-10">
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden relative border border-gray-50">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-[1.2s] ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                  style={{ 
                    width: activeOrder.status === 'Pending' ? '20%' :
                           activeOrder.status === 'Preparing' ? '65%' :
                           (activeOrder.status === 'Served' || activeOrder.status === 'Completed') ? '100%' : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 mt-8" suppressHydrationWarning>
        {/* Brand Story Section with refined spacing */}
        <div className="mb-10 text-center px-4">
          <p className="text-gray-500 font-medium leading-relaxed italic max-w-2xl mx-auto text-[1rem]">
            &quot;Our Chefs traveled the globe to bring the best flavours for you. Make sure you taste a bit from every course.&quot;
          </p>
        </div>

        {/* Menu Items grouped by Category */}
        <div className="flex flex-col" suppressHydrationWarning>
          {categories.map((category) => {
            const itemsInCategory = sortedAndFilteredItems.filter(item => item.category === category);
            if (itemsInCategory.length === 0) return null;

            return (
              <div key={category} id={category} className="scroll-mt-[100px] mb-8">
                <div className="flex items-center gap-2.5 mb-4 mt-6">
                  {getCategoryIcon(category)}
                  <h2 className="font-black text-gray-900 text-[1.2rem] md:text-[1.5rem] tracking-tight uppercase">
                    {category}
                  </h2>
                </div>

                <div className="flex flex-col">
                  {itemsInCategory.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      quantity={cart.find(i => i.id === item.id)?.quantity || 0}
                      onAdd={addToCart}
                      onUpdateQuantity={updateQuantity}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Action Elements (Cart & Status) */}
      {mounted && cartCount > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-[30px] right-[30px] bg-green-500 text-white px-6 py-4 rounded-full flex items-center gap-3 shadow-[0_12px_24px_rgba(249,115,22,0.3)] hover:bg-green-600 transition-colors z-[90] hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <ShoppingBag size={24} />
            <span className="absolute -top-2 -right-2 bg-white text-green-600 text-[0.7rem] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
              {cartCount}
            </span>
          </div>
          <span className="font-black text-[1rem]">View Cart</span>
        </button>
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

      {/* Custom Tailwind Toast for Order Success */}
      <div 
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1500] transition-all duration-500 transform ${orderSuccess ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'}`}
      >
        <div className="bg-green-500 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm">
          <CheckCircle2 size={20} />
          Order placed successfully! Tracking is active.
        </div>
      </div>
    </div>
  );
}
