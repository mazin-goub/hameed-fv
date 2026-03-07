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

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [location, setLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [showCheckout, setShowCheckout] = useState(false);

  if (!menuItems) {
    return (
      <div className="flex justify-center items-center min-h-64">
        Loading...
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

  const getLocation = () => {

    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const { latitude, longitude } = position.coords;

        try {

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          const data = await res.json();

          setLocation(data.display_name);

          toast.success("Location detected!");

        } catch {

          toast.error("Failed to detect address");

        }

        setLoadingLocation(false);

      },

      () => {

        toast.error("Location permission denied");
        setLoadingLocation(false);

      }

    );
  };

  const handleCheckout = async () => {

    if (!customerName || !customerPhone) {
      toast.error("Please enter contact details");
      return;
    }

    if (!location) {
      toast.error("Please share your location");
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const orderDate = new Date().toISOString();

    try {

      await createOrder({

        customerName,
        customerPhone,
        orderType: "delivery",
        eventLocation: location,
        eventDate: orderDate,

        items: cart.map(item => ({
          name: item.name,
          type: item.type,
          quantity: item.quantity,
          customizations: item.customizations,
          price: item.price,
        })),

        totalAmount: getTotalAmount(),

      });

      toast.success("Order placed!");

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setLocation("");
      setShowCheckout(false);

      onBack();

    } catch {

      toast.error("Failed to place order");

    }
  };

  return (
    <div className="max-w-6xl mx-auto" style={{ color: '#facc15' }}>

      <div className="flex justify-between mb-8">

        <button onClick={onBack}>
          ← Back
        </button>

        <h1 className="text-4xl font-bold">
          Menu
        </h1>

        <button onClick={() => setShowCheckout(true)}>
          Cart ({cart.length})
        </button>

      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

        {menuItems.map((item) => (

          <div key={item._id} className="p-6 border rounded-xl">

            <h3 className="text-xl font-bold mb-2">
              {item.name}
            </h3>

            <p className="mb-4">
              {item.description}
            </p>

            <button
              onClick={() => setSelectedItem(item)}
            >
              Customize & Add
            </button>

          </div>

        ))}

      </div>

      {showCheckout && (

        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">

          <div className="p-6 rounded-xl bg-[#451a03] w-[400px]">

            <h2 className="text-2xl font-bold mb-4">
              Checkout
            </h2>

            <button
              onClick={getLocation}
              className="w-full mb-4 p-3 bg-yellow-400 text-black rounded"
            >
              {loadingLocation ? "Detecting location..." : "Use my location"}
            </button>

            {location && (
              <div className="mb-4 text-sm">
                {location}
              </div>
            )}

            <input
              placeholder="Full Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full mb-3 p-2"
            />

            <input
              placeholder="Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full mb-3 p-2"
            />

            <div className="mb-4">
              Total: {getTotalAmount()}
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-yellow-400 text-black p-3 rounded"
            >
              Place Order
            </button>

          </div>

        </div>

      )}

    </div>
  );
}
