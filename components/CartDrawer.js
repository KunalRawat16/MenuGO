"use client";

import { X, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => setMounted(true), []);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async () => {
    const newErrors = {};
    if (!customerName.trim()) {
      newErrors.name = "Name is required.";
    } else if (customerName.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters.";
    }

    const tableNum = Number(tableNumber.trim());
    if (!tableNumber.trim()) {
      newErrors.table = "Table number is required.";
    } else if (isNaN(tableNum) || tableNum <= 0) {
      newErrors.table = "Table number must be greater than 0.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    await onPlaceOrder({ customerName: customerName.trim(), tableNumber: tableNumber.trim() });
    setIsSubmitting(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        aria-hidden="true"
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label={`Shopping Cart for ${restaurantName}`}
        className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'} sm:rounded-l-2xl`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">Your Cart</h2>
            <button 
              onClick={onClose}
              aria-label="Close cart"
              className="p-2 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <X size={24} />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50">
              <ShoppingCart size={64} strokeWidth={1} className="text-gray-400" aria-hidden="true" />
              <p className="mt-4 font-bold text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <p className="text-sm font-medium text-gray-500">₹{item.price} each</p>
                      </div>
                      <span className="font-black text-gray-900 text-lg">₹{item.price * item.quantity}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-1">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="w-8 h-8 flex items-center justify-center bg-white text-green-500 rounded-lg shadow-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors"
                        >
                          <Minus size={16} strokeWidth={3} />
                        </button>
                        <span aria-live="polite" className="min-w-[24px] text-center font-black text-gray-900">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors"
                        >
                          <Plus size={16} strokeWidth={3} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => onRemove(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-extrabold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-green-600">₹{total}</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="customer-name" className="block text-sm font-bold text-gray-700 mb-1.5">Your Name <span className="text-red-500">*</span></label>
                    <input 
                      id="customer-name"
                      type="text" 
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                      }}
                      placeholder="e.g. Kunal Rawat"
                      maxLength={50}
                      aria-describedby={errors.name ? "customer-name-error" : undefined}
                      className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:outline-none transition-shadow focus-visible:ring-2 ${
                        errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                      }`}
                    />
                    {errors.name && <p id="customer-name-error" className="text-red-500 text-xs font-bold mt-1.5">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="table-number" className="block text-sm font-bold text-gray-700 mb-1.5">Table Number <span className="text-red-500">*</span></label>
                    <input 
                      id="table-number"
                      type="number" 
                      min="1"
                      value={tableNumber}
                      onChange={(e) => {
                        setTableNumber(e.target.value);
                        if (errors.table) setErrors(prev => ({ ...prev, table: null }));
                      }}
                      placeholder="e.g. 5"
                      aria-describedby={errors.table ? "table-number-error" : undefined}
                      className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:outline-none transition-shadow focus-visible:ring-2 ${
                        errors.table ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                      }`}
                    />
                    {errors.table && <p id="table-number-error" className="text-red-500 text-xs font-bold mt-1.5">{errors.table}</p>}
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl shadow-[0_8px_16px_-4px_rgba(249,115,22,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                >
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
