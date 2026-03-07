import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface MenuPageProps {
  onBack: () => void;
}

interface CartItem {
  id: string;
  name: string;
  type: "burger" | "liver" | "sausage" | "kofta" | "lasagna" | "Lasagna" | "drinks" | "deserts" | "appetizers" | "Bukhari" | "Mandi" | "Musakhan";
  quantity: number;
  customizations: string[];
  price: number;
}

export function MenuPage({ onBack }: MenuPageProps) {
  const menuItems = useQuery(api.menu.getMenuItems);
  const createOrder = useMutation(api.orders.createOrder);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  if (!menuItems) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#facc15', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const addToCart = () => {
    if (!selectedItem) return;

    const customizationPrice = selectedCustomizations.reduce((total, customization) => {
      const custom = selectedItem.customizations.find((c: any) => c.name === customization);
      return total + (custom?.price || 0);
    }, 0);

    const totalPrice = (selectedItem.basePrice + customizationPrice) * quantity;

    const cartItem: CartItem = {
      id: `${selectedItem._id}-${Date.now()}`,
      name: selectedItem.name,
      type: selectedItem.type,
      quantity,
      customizations: [...selectedCustomizations],
      price: totalPrice,
    };

    setCart([...cart, cartItem]);
    setSelectedItem(null);
    setSelectedCustomizations([]);
    setQuantity(1);
    toast.success("Added to cart!");
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const handleCheckout = async () => {
    if (!customerName || !customerPhone || !eventDate || !eventLocation) {
      toast.error("Please fill in all fields");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      await createOrder({
        customerName,
        customerPhone,
        orderType: "delivery",
        items: cart.map(item => ({
          name: item.name,
          type: item.type,
          quantity: item.quantity,
          customizations: item.customizations,
          price: item.price,
        })),
        totalAmount: getTotalAmount(),
        eventDate,       // new field
        eventLocation,   // new field
      });

      toast.success("Order placed successfully!");
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setEventDate("");
      setEventLocation("");
      setShowCheckout(false);
      onBack();
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  const getItemEmoji = (type: string) => {
    switch (type) {
      case 'burger': return '🍔';
      case 'liver': return '🥪';
      case 'sausage': return '🌭';
      case 'kofta': return '🥙';
      case 'lasagna':
      case 'Lasagna': return '🍝';
      case 'drinks': return '🥤';
      case 'deserts': return '🍰';
      case 'appetizers': return '';
      case 'Bukhari': return '';
      case 'Mandi': return '';
      case 'Musakhan': return '';
      default: return '🍽️';
    }
  };

  return (
    <div className="max-w-6xl mx-auto" style={{ color: '#facc15' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 transition-colors"
          style={{ color: '#facc15' }}
        >
          <span>←</span>
          <span>Back Home</span>
        </button>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold" style={{ color: '#facc15' }}>Menu</h1>
          {/* <p style={{ color: '#d97706' }}>UFO-Sealed Delicacies</p> */}
        </div>

        <button
          onClick={() => setShowCheckout(true)}
          className="px-6 py-3 rounded-full font-semibold transition-all shadow-lg relative"
          style={{ background: 'linear-gradient(to right, #facc15, #d97706)', color: '#451a03' }}
        >
          Cart ({cart.length})
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 text-xs rounded-full w-6 h-6 flex items-center justify-center" style={{ backgroundColor: '#d97706', color: '#1d0e01' }}>
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Menu Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuItems.map((item) => (
          <div key={item._id} className="rounded-2xl shadow-xl overflow-hidden transition-all transform hover:scale-105" style={{ backgroundColor: '#451a03', border: `1px solid #facc15` }}>
            {/* Item Image */}
            <div className="h-48 flex items-center justify-center relative" style={{ background: 'linear-gradient(to bottom right, #451a03, #1d0e01)' }}>
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-6xl opacity-70" style={{ color: '#facc15' }}>
                  {getItemEmoji(item.type)}
                </div>
              )}
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#facc15', color: '#451a03' }}>
                {item.basePrice}<small>EGP</small>
              </div>
            </div>

            {/* Item Details */}
            <div className="p-6" style={{ backgroundColor: '#451a03' }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#facc15' }}>{item.name}</h3>
              <p className="mb-4 text-sm" style={{ color: '#d97706' }}>{item.description}</p>
              
              <button
                onClick={() => setSelectedItem(item)}
                className="w-full py-3 rounded-lg font-semibold transition-all shadow-lg"
                style={{ background: 'linear-gradient(to right, #facc15, #d97706)', color: '#451a03' }}
              >
                Customize & Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customization Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#451a03', border: `1px solid #facc15` }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold" style={{ color: '#facc15' }}>{selectedItem.name}</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-2xl"
                  style={{ color: '#facc15' }}
                >
                  ×
                </button>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block font-semibold mb-2" style={{ color: '#facc15' }}>Quantity</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors"
                    style={{ backgroundColor: '#451a03', color: '#facc15', border: `1px solid #facc15` }}
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold" style={{ color: '#facc15' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors"
                    style={{ backgroundColor: '#451a03', color: '#facc15', border: `1px solid #facc15` }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Customizations */}
              <div className="mb-6">
                <label className="block font-semibold mb-3" style={{ color: '#facc15' }}>Customizations</label>
                <div className="space-y-2">
                  {selectedItem.customizations.map((custom: any) => (
                    <label key={custom.name} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCustomizations.includes(custom.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCustomizations([...selectedCustomizations, custom.name]);
                          } else {
                            setSelectedCustomizations(selectedCustomizations.filter(c => c !== custom.name));
                          }
                        }}
                        className="w-5 h-5 rounded focus:ring-amber-500"
                        style={{ accentColor: '#facc15' }}
                      />
                      <span style={{ color: '#facc15' }}>{custom.name}</span>
                      <span className="font-semibold" style={{ color: '#d97706' }}>
                        {custom.price > 0 ? `+${custom.price} EGP` : 'Free'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#1d0e01' }}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold" style={{ color: '#facc15' }}>Total Price:</span>
                  <span className="text-2xl font-bold" style={{ color: '#facc15' }}>
                    {((selectedItem.basePrice + selectedCustomizations.reduce((total, customization) => {
                      const custom = selectedItem.customizations.find((c: any) => c.name === customization);
                      return total + (custom?.price || 0);
                    }, 0)) * quantity).toFixed(2)} EGP
                  </span>
                </div>
              </div>

              <button
                onClick={addToCart}
                className="w-full py-3 rounded-lg font-semibold transition-all shadow-lg"
                style={{ background: 'linear-gradient(to right, #facc15, #d97706)', color: '#451a03' }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#451a03', border: `1px solid #facc15` }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold" style={{ color: '#facc15' }}>Checkout</h3>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-2xl"
                  style={{ color: '#facc15' }}
                >
                  ×
                </button>
              </div>

              {/* Cart Items */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3" style={{ color: '#facc15' }}>Your Order</h4>
                {cart.length === 0 ? (
                  <p style={{ color: '#d97706' }}>Your cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: '#1d0e01' }}>
                        <div className="flex-1">
                          <div className="font-semibold" style={{ color: '#facc15' }}>{item.name}</div>
                          <div className="text-sm" style={{ color: '#d97706' }}>Qty: {item.quantity}</div>
                          {item.customizations.length > 0 && (
                            <div className="text-xs" style={{ color: '#d97706' }}>
                              {item.customizations.join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold" style={{ color: '#facc15' }}>{item.price.toFixed(2)} EGP</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{ color: '#d97706' }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Details */}
              <div className="mb-6 space-y-4">
                <h4 className="font-semibold" style={{ color: '#facc15' }}>Contact Details</h4>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                  style={{ backgroundColor: '#451a03', borderColor: '#facc15', color: '#facc15' }}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                  style={{ backgroundColor: '#451a03', borderColor: '#facc15', color: '#facc15' }}
                />
                <input
                  type="date"
                  placeholder="Event Date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                  style={{ backgroundColor: '#451a03', borderColor: '#facc15', color: '#facc15' }}
                />
                <input
                  type="text"
                  placeholder="Event Location"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                  style={{ backgroundColor: '#451a03', borderColor: '#facc15', color: '#facc15' }}
                />
              </div>

              {/* Total */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#1d0e01' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold" style={{ color: '#facc15' }}>Total:</span>
                  <span className="text-2xl font-bold" style={{ color: '#facc15' }}>{getTotalAmount().toFixed(2)} EGP</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-3 rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(to right, #facc15, #d97706)', color: '#451a03' }}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}