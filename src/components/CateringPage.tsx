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
  const menuItems = useQuery(api.menu.getMenuItems); // جلب عناصر القائمة

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    eventDate: "",
    eventLocation: "",
    guestCount: "",
    notes: "",
  });

  // حالة لتخزين الكميات لكل عنصر من القائمة
  const [cateringItems, setCateringItems] = useState<Array<{ itemId: string; name: string; price: number; quantity: number }>>([]);

  // عند تحميل menuItems، نقوم ببناء cateringItems الأولي
  useEffect(() => {
    if (menuItems) {
      const initialItems = menuItems.map((item: any) => ({
        itemId: item._id,
        name: item.name,
        price: item.basePrice,
        quantity: 0,
      }));
      setCateringItems(initialItems);
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
    const basePricePerGuest = 15; // يمكن جعلها قابلة للتكوين لاحقاً
    const guestCount = parseInt(formData.guestCount) || 0;
    const itemsTotal = cateringItems.reduce((total, item) => total + (item.quantity * item.price), 0);
    return (guestCount * basePricePerGuest) + itemsTotal;
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
        cateringItems: selectedItems.map(item => ({
          item: item.name,   // فقط الاسم كما يتوقعه الـ mutation
          quantity: item.quantity,
        })),
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
      // إعادة تعيين الكميات إلى 0
      setCateringItems(prev => prev.map(item => ({ ...item, quantity: 0 })));
      onBack();
    } catch (error) {
      toast.error("Failed to submit catering request");
    }
  };

  if (!menuItems) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#facc15', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto" style={{ color: '#facc15' }}>
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
          <h1 className="text-4xl font-bold" style={{ color: '#facc15' }}>Catering</h1>
          <p style={{ color: '#d97706' }}>Premium Event Services</p>
        </div>

        <div></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Event Details Form */}
        <div className="rounded-2xl shadow-xl p-8" style={{ backgroundColor: '#451a03', border: `1px solid #facc15` }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#facc15' }}>Event Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block font-semibold mb-2" style={{ color: '#facc15' }}>Contact Name *</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                style={{ backgroundColor: '#451a03', borderColor: '#facc15', color: '#facc15' }}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: '#facc15' }}>Phone Number *</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                style={{ backgroundColor: '#451a03', borderColor: '#facc15', color: '#facc15' }}
                placeholder="Your phone number"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: '#facc15' }}>Event Date *</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleInputChange('eventDate', e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                style={{ backgroundColor: '#451a03', borderColor: '#facc15', color: '#facc15' }}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: '#facc15' }}>Event Location *</label>
              <input
                type="text"
                value={formData.eventLocation}
                onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                style={{ backgroundColor: '#451a03', borderColor: '#facc15', color: '#facc15' }}
                placeholder="Event venue address"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: '#facc15' }}>Number of Guests *</label>
              <input
                type="number"
                value={formData.guestCount}
                onChange={(e) => handleInputChange('guestCount', e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                style={{ backgroundColor: '#451a03', borderColor: '#facc15', color: '#facc15' }}
                placeholder="Expected number of guests"
                min="1"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: '#facc15' }}>Special Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none h-24 resize-none"
                style={{ backgroundColor: '#451a03', borderColor: '#facc15', color: '#facc15' }}
                placeholder="Any special requirements or dietary restrictions..."
              />
            </div>
          </div>
        </div>

        {/* Menu Selection */}
        <div className="rounded-2xl shadow-xl p-8" style={{ backgroundColor: '#451a03', border: `1px solid #facc15` }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#facc15' }}>Menu Selection</h2>
          
          <div className="space-y-4 mb-8">
            {cateringItems.map((item, index) => (
              <div key={item.itemId} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#1d0e01' }}>
                <div className="flex-1">
                  <span className="font-semibold" style={{ color: '#facc15' }}>{item.name}</span>
                  <div className="text-sm" style={{ color: '#d97706' }}>{item.price} EGP per serving</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleItemQuantityChange(index, item.quantity - 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors"
                    style={{ backgroundColor: '#451a03', color: '#facc15', border: `1px solid #facc15` }}
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold" style={{ color: '#facc15' }}>{item.quantity}</span>
                  <button
                    onClick={() => handleItemQuantityChange(index, item.quantity + 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors"
                    style={{ backgroundColor: '#451a03', color: '#facc15', border: `1px solid #facc15` }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Price Estimate */}
          <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: '#1d0e01' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#facc15' }}>Price Estimate</h3>
            <div className="space-y-2" style={{ color: '#d97706' }}>
              <div className="flex justify-between">
                <span>Base Service ({formData.guestCount || 0} guests)</span>
                <span style={{ color: '#facc15' }}>{((parseInt(formData.guestCount) || 0) * 15).toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>Additional Items</span>
                <span style={{ color: '#facc15' }}>{(cateringItems.reduce((total, item) => total + (item.quantity * item.price), 0)).toFixed(2)} EGP</span>
              </div>
              <div className="border-t pt-2 mt-2" style={{ borderColor: '#facc15' }}>
                <div className="flex justify-between font-bold text-lg">
                  <span style={{ color: '#facc15' }}>Total Estimate</span>
                  <span style={{ color: '#facc15' }}>{calculateEstimate().toFixed(2)} EGP</span>
                </div>
              </div>
            </div>
            <p className="text-sm mt-3" style={{ color: '#d97706' }}>
              * Final pricing may vary based on specific requirements and menu customizations
            </p>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-lg font-semibold transition-all shadow-lg text-lg"
            style={{ background: 'linear-gradient(to right, #facc15, #d97706)', color: '#451a03' }}
          >
            Submit Catering Request
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16 rounded-2xl shadow-xl p-8" style={{ backgroundColor: '#451a03', border: `1px solid #facc15` }}>
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#facc15' }}>Our Catering Services Include</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #facc15, #d97706)' }}>
              <span className="text-2xl" style={{ color: '#451a03' }}>🍽️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#facc15' }}>Full Service Setup</h3>
            <p style={{ color: '#d97706' }}>Complete table setup, serving equipment, and professional presentation</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #facc15, #d97706)' }}>
              <span className="text-2xl" style={{ color: '#451a03' }}>👨‍🍳</span>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#facc15' }}>Professional Staff</h3>
            <p style={{ color: '#d97706' }}>Experienced catering staff to ensure smooth service throughout your event</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #facc15, #d97706)' }}>
              <span className="text-2xl" style={{ color: '#451a03' }}>🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#facc15' }}>Custom Menus</h3>
            <p style={{ color: '#d97706' }}>Tailored menu options to match your event theme and dietary requirements</p>
          </div>
        </div>
      </div>
    </div>
  );
}