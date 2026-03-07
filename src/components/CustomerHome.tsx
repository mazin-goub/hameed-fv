import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

interface CustomerHomeProps {
  onNavigate: (page: 'menu' | 'catering') => void;
}

export function CustomerHome({ onNavigate }: CustomerHomeProps) {
  const seedMenu = useMutation(api.menu.seedMenuItems);

  useEffect(() => {
    seedMenu();
  }, [seedMenu]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#fad96e' }}>
          Hameed Catering Food & Services
        </h1>
        <p className="text-xl mb-8" style={{ color: '#d97706' }}>
         ✨ Hameed Catering & Food Services✨
Premium meals for gatherings, events, parties & birthdays 🍽️
Top-quality ingredients with unforgettable flavor that keeps you coming back 🔥
We serve your occasions with food that looks amazing.and tastes even better 😍
        </p>

        {/* Ornamental Divider – ذهبي بدون نقاط */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-px w-32" style={{ background: `linear-gradient(to right, transparent, #fad96e, transparent)` }}></div>
          <div className="mx-4 w-8 h-8 rounded-full" style={{ border: `2px solid #fad96e`, opacity: 0.5 }}></div>
          <div className="h-px w-32" style={{ background: `linear-gradient(to right, transparent, #fad96e, transparent)` }}></div>
        </div>
      </div>

      {/* Service Selection Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Delivery Order Card */}
        <div
          onClick={() => onNavigate('menu')}
          className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
        >
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#451a03', border: `1px solid #fad96e` }}>
            {/* Card Header */}
            <div className="p-8 text-center" style={{ background: `linear-gradient(to right, #451a03, #1d0e01)` }}>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, #fad96e, #d97706)`, boxShadow: '0 10px 20px rgba(250, 204, 21, 0.3)' }}>
                  <span className="text-2xl">🛸</span>
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#fad96e' }}>Order Now</h3>
                <p style={{ color: '#d97706' }}> Delivery</p>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-8" style={{ backgroundColor: '#1d0e01' }}>
              <div className="space-y-4">
                {[
                  'Burger',
                  'Liver Sandwich',
                  'Classic Sausage',
                  'Kofta Delight',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#fad96e' }}></div>
                    <span style={{ color: '#fad96e' }}>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button className="inline-flex items-center px-6 py-3 rounded-full font-semibold transition-all" style={{ background: `linear-gradient(to right, #fad96e, #d97706)`, color: '#451a03' }}>
                  Explore Menu
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Catering Services Card */}
        <div
          onClick={() => onNavigate('catering')}
          className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
        >
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#451a03', border: `1px solid #fad96e` }}>
            {/* Card Header */}
            <div className="p-8 text-center" style={{ background: `linear-gradient(to right, #451a03, #1d0e01)` }}>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, #fad96e, #d97706)`, boxShadow: '0 10px 20px rgba(250, 204, 21, 0.3)' }}>
                  <span className="text-2xl">👑</span>
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#fad96e' }}>Catering Services</h3>
                <p style={{ color: '#d97706' }}>Royal Event Experience</p>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-8" style={{ backgroundColor: '#1d0e01' }}>
              <div className="space-y-4">
                {[
                  'Wedding Celebrations',
                  'Corporate Events',
                  'Private Parties',
                  'Custom Menus',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#fad96e' }}></div>
                    <span style={{ color: '#fad96e' }}>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button className="inline-flex items-center px-6 py-3 rounded-full font-semibold transition-all" style={{ background: `linear-gradient(to right, #fad96e, #d97706)`, color: '#451a03' }}>
                  Plan Event
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold mb-8" style={{ color: '#fad96e' }}>Why Choose Hameed Catering?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '⭐', title: 'Premium Quality', desc: 'Fresh ingredients and royal recipes passed down through generations' },
            { icon: '🚀', title: 'Fast Delivery', desc: 'Delivered to your doorstep in record time' },
            { icon: '🎯', title: 'Custom Service', desc: 'Tailored to your preferences with extensive customization options' },
          ].map((feature, idx) => (
            <div key={idx} className="rounded-xl p-6 transition-all" style={{ backgroundColor: '#451a03', border: `1px solid #fad96e` }}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, #fad96e, #d97706)` }}>
                <span className="text-xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#fad96e' }}>{feature.title}</h3>
              <p style={{ color: '#d97706' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}