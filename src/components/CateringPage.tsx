import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CateringPageProps {
  onBack: () => void;
}

export function CateringPage({ onBack }: CateringPageProps) {
  const createOrder = useMutation(api.orders.createOrder);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const menuItems = useQuery(api.menu.getMenuItems); // 🔹 جلب العناصر من Convex

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    eventDate: "",
    eventLocation: "",
    guestCount: "",
    notes: "",
  });

  const [cateringItems, setCateringItems] = useState<{ item: string; quantity: number }[]>([]);

  // 🔹 Initializing cateringItems from menuItems dynamically
  useEffect(() => {
    if (menuItems) {
      const catering = menuItems.map((menuItem: any) => ({
        item: menuItem.name,
        quantity: 0,
      }));
      setCateringItems(catering);
    }
  }, [menuItems]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemQuantityChange = (index: number, quantity: number) => {
    setCateringItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, quantity: Math.max(0, quantity) } : item
      )
    );
  };

  const calculateEstimate = () => {
    const basePrice = 15; // Base price per person
    const guestCount = parseInt(formData.guestCount) || 0;
    const itemsTotal = cateringItems.reduce((total, item) => total + (item.quantity * 8), 0);
    return (guestCount * basePrice) + itemsTotal;
  };

  const handleSubmit = async () => {
    if (!formData.customerName || !formData.customerPhone || !formData.eventDate || !formData.eventLocation || !formData.guestCount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedItems = cateringItems.filter(item => item.quantity > 0);
    if (selectedItems.length === 0) {
      toast.error("Please select at least one catering item");
      return;
    }

    try {
      await createOrder({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        orderType: "catering",
        eventDate: formData.eventDate,
        eventLocation: formData.eventLocation,
        guestCount: parseInt(formData.guestCount),
        cateringItems: selectedItems,
        totalAmount: calculateEstimate(),
        notes: formData.notes,
      });

      toast.success("Catering request submitted successfully!");
      setFormData({
        customerName: "",
        customerPhone: "",
        eventDate: "",
        eventLocation: "",
        guestCount: "",
        notes: "",
      });
      setCateringItems(prev => prev.map(item => ({ ...item, quantity: 0 })));
      onBack();
    } catch (error) {
      toast.error("Failed to submit catering request");
    }
  };

  if (!menuItems) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div
          className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
          style={{ borderColor: '#facc15', borderTopColor: 'transparent' }}
        ></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto" style={{ color: '#facc15' }}>
      {/* باقي الصفحة زي ما هي */}
      {/* ... Event Details Form ... */}
      {/* ... Menu Selection ... */}
      {cateringItems.map((item, index) => (
        <div key={index}>
          <span>{item.item}</span>
          <button onClick={() => handleItemQuantityChange(index, item.quantity - 1)}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => handleItemQuantityChange(index, item.quantity + 1)}>+</button>
        </div>
      ))}
      <button onClick={handleSubmit}>Submit Catering Request</button>
    </div>
  );
}
