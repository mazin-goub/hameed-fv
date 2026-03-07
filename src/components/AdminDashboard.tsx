import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef } from "react";
import { toast } from "sonner";

export function AdminDashboard() {
  const orders = useQuery(api.orders.getAllOrders);
  const menuItems = useQuery(api.menu.getAllMenuItems);
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);
  const addMenuItem = useMutation(api.menu.addMenuItem);
  const updateMenuItem = useMutation(api.menu.updateMenuItem);
  const deleteMenuItem = useMutation(api.menu.deleteMenuItem);
  const generateUploadUrl = useMutation(api.menu.generateUploadUrl);
  
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'completed'>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  
  const [newItem, setNewItem] = useState({
    name: "",
    type: "burger" as "burger" | "liver" | "sausage" | "kofta" | "lasagna" | "Lasagna" | "drinks" | "deserts" | "appetizers" | "Bukhari" | "Mandi" | "Musakhan",
    description: "",
    basePrice: 0,
    image: null as string | null,
    customizations: [{ name: "", price: 0 }],
  });

  if (!orders || !menuItems) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#fad96e', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(order => order.status === filter);

  const handleStatusUpdate = async (orderId: string, status: 'accepted' | 'rejected' | 'completed') => {
    try {
      await updateOrderStatus({ orderId: orderId as any, status });
      toast.success(`Order ${status} successfully`);
    } catch (error) {
      toast.error(`Failed to ${status} order`);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) {
        throw new Error("Upload failed");
      }
      
      const { storageId } = await result.json();
      return storageId;
    } catch (error) {
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.description || newItem.basePrice <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const validCustomizations = newItem.customizations.filter(c => c.name.trim() !== "");

    try {
      let imageId = null;
      if (imageInput.current?.files?.[0]) {
        imageId = await handleImageUpload(imageInput.current.files[0]);
      }

      await addMenuItem({
        name: newItem.name,
        type: newItem.type,
        description: newItem.description,
        basePrice: newItem.basePrice,
        image: imageId,
        customizations: validCustomizations,
      });

      toast.success("Menu item added successfully!");
      setNewItem({
        name: "",
        type: "burger",
        description: "",
        basePrice: 0,
        image: null,
        customizations: [{ name: "", price: 0 }],
      });
      setShowAddItem(false);
      if (imageInput.current) imageInput.current.value = "";
    } catch (error) {
      toast.error("Failed to add menu item");
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      let imageId = editingItem.image;
      if (imageInput.current?.files?.[0]) {
        imageId = await handleImageUpload(imageInput.current.files[0]);
      }

      const validCustomizations = editingItem.customizations.filter((c: any) => c.name.trim() !== "");

      await updateMenuItem({
        itemId: editingItem._id,
        name: editingItem.name,
        type: editingItem.type,
        description: editingItem.description,
        basePrice: editingItem.basePrice,
        available: editingItem.available,
        image: imageId,
        customizations: validCustomizations,
      });

      toast.success("Menu item updated successfully!");
      setEditingItem(null);
      if (imageInput.current) imageInput.current.value = "";
    } catch (error) {
      toast.error("Failed to update menu item");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      await deleteMenuItem({ itemId: itemId as any });
      toast.success("Menu item deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete menu item");
    }
  };

  const addCustomization = (isEditing = false) => {
    if (isEditing && editingItem) {
      setEditingItem({
        ...editingItem,
        customizations: [...editingItem.customizations, { name: "", price: 0 }]
      });
    } else {
      setNewItem({
        ...newItem,
        customizations: [...newItem.customizations, { name: "", price: 0 }]
      });
    }
  };

  const removeCustomization = (index: number, isEditing = false) => {
    if (isEditing && editingItem) {
      setEditingItem({
        ...editingItem,
        customizations: editingItem.customizations.filter((_: any, i: number) => i !== index)
      });
    } else {
      setNewItem({
        ...newItem,
        customizations: newItem.customizations.filter((_, i) => i !== index)
      });
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#d97706', color: '#1d0e01' };
      case 'accepted':
        return { backgroundColor: '#fad96e', color: '#451a03' };
      case 'rejected':
        return { backgroundColor: '#451a03', color: '#fad96e', border: `1px solid #fad96e` };
      case 'completed':
        return { backgroundColor: '#1d0e01', color: '#fad96e', border: `1px solid #d97706` };
      default:
        return { backgroundColor: '#451a03', color: '#fad96e' };
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
      case '': return '🥤';
      case 'deserts': return '🍰';
      case 'appetizers': return '';
      case 'Bukhari': return '';
      case 'Mandi': return '';
      case 'Musakhan': return '';
      default: return '🍽️';
    }
  };

  return (
    <div className="max-w-7xl mx-auto" style={{ color: '#fad96e' }}>
      {/* Admin Header */}
      <div className="rounded-2xl p-8 mb-8 shadow-2xl" style={{ background: 'linear-gradient(to right, #451a03, #1d0e01, #451a03)', border: `1px solid #fad96e` }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#fad96e' }}>Admin Dashboard</h1>
            <p style={{ color: '#d97706' }}>Hameed Catering Management System</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: '#fad96e' }}>{orders.length}</div>
            <div style={{ color: '#d97706' }}>Total Orders</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all`}
          style={
            activeTab === 'orders'
              ? { background: 'linear-gradient(to right, #fad96e, #d97706)', color: '#451a03' }
              : { backgroundColor: '#1d0e01', color: '#fad96e', border: `1px solid #fad96e` }
          }
        >
          📋 Orders Management
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all`}
          style={
            activeTab === 'menu'
              ? { background: 'linear-gradient(to right, #fad96e, #d97706)', color: '#451a03' }
              : { backgroundColor: '#1d0e01', color: '#fad96e', border: `1px solid #fad96e` }
          }
        >
          🍔 Menu Management
        </button>
      </div>

      {activeTab === 'orders' && (
        <>
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="rounded-xl p-6 shadow-lg" style={{ backgroundColor: '#451a03', border: `1px solid #fad96e` }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#fad96e' }}>
                    {orders.filter(o => o.status === 'pending').length}
                  </div>
                  <div style={{ color: '#d97706' }}>Pending</div>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1d0e01' }}>
                  <span className="text-xl" style={{ color: '#fad96e' }}>⏳</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-6 shadow-lg" style={{ backgroundColor: '#451a03', border: `1px solid #fad96e` }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#fad96e' }}>
                    {orders.filter(o => o.status === 'accepted').length}
                  </div>
                  <div style={{ color: '#d97706' }}>Accepted</div>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1d0e01' }}>
                  <span className="text-xl" style={{ color: '#fad96e' }}>✅</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-6 shadow-lg" style={{ backgroundColor: '#451a03', border: `1px solid #fad96e` }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#fad96e' }}>
                    {orders.filter(o => o.status === 'completed').length}
                  </div>
                  <div style={{ color: '#d97706' }}>Completed</div>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1d0e01' }}>
                  <span className="text-xl" style={{ color: '#fad96e' }}>🎉</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-6 shadow-lg" style={{ backgroundColor: '#451a03', border: `1px solid #fad96e` }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#fad96e' }}>
                    LE{orders.reduce((total, order) => total + order.totalAmount, 0).toFixed(2)}
                  </div>
                  <div style={{ color: '#d97706' }}>Total Revenue</div>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1d0e01' }}>
                  <span className="text-xl" style={{ color: '#fad96e' }}>💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            {['all', 'pending', 'accepted', 'rejected', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all`}
                style={
                  filter === status
                    ? { background: 'linear-gradient(to right, #fad96e, #d97706)', color: '#451a03' }
                    : { backgroundColor: '#1d0e01', color: '#fad96e', border: `1px solid #fad96e` }
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({
                  status === 'all' ? orders.length : orders.filter(o => o.status === status).length
                })
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#fad96e' }}>No Orders Found</h3>
                <p style={{ color: '#d97706' }}>No orders match the current filter.</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order._id} className="rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: '#451a03', border: `1px solid #fad96e` }}>
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between mb-6">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-xl font-bold" style={{ color: '#fad96e' }}>
                            {order.orderType === 'delivery' ? '🛸 Delivery Order' : '👑 Catering Service'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold`} style={getStatusStyle(order.status)}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm" style={{ color: '#d97706' }}>
                          Order ID: {order._id} • {new Date(order._creationTime).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: '#fad96e' }}>LE{order.totalAmount.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* Customer Info */}
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#1d0e01' }}>
                        <h4 className="font-semibold mb-3" style={{ color: '#fad96e' }}>Customer Information</h4>
                        <div className="space-y-2 text-sm" style={{ color: '#d97706' }}>
                          <div><strong style={{ color: '#fad96e' }}>Name:</strong> {order.customerName}</div>
                          <div><strong style={{ color: '#fad96e' }}>Email:</strong> {order.customerEmail}</div>
                          <div><strong style={{ color: '#fad96e' }}>Phone:</strong> {order.customerPhone}</div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#1d0e01' }}>
                        <h4 className="font-semibold mb-3" style={{ color: '#fad96e' }}>Order Details</h4>
                        {order.orderType === 'delivery' && order.items && (
                          <div className="space-y-2 text-sm" style={{ color: '#d97706' }}>
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <span>{item.name} x{item.quantity}</span>
                                <span style={{ color: '#fad96e' }}>LE{item.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {order.orderType === 'catering' && (
                          <div className="space-y-2 text-sm" style={{ color: '#d97706' }}>
                            <div><strong style={{ color: '#fad96e' }}>Event Date:</strong> {order.eventDate}</div>
                            <div><strong style={{ color: '#fad96e' }}>Location:</strong> {order.eventLocation}</div>
                            <div><strong style={{ color: '#fad96e' }}>Guests:</strong> {order.guestCount}</div>
                            {order.cateringItems && (
                              <div className="mt-3">
                                <strong style={{ color: '#fad96e' }}>Items:</strong>
                                {order.cateringItems.map((item, index) => (
                                  <div key={index} className="ml-2">
                                    {item.item}: {item.quantity} servings
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {order.notes && (
                      <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#1d0e01' }}>
                        <h4 className="font-semibold mb-2" style={{ color: '#fad96e' }}>Special Notes</h4>
                        <p className="text-sm" style={{ color: '#d97706' }}>{order.notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {order.status === 'pending' && (
                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'accepted')}
                          className="flex-1 min-w-32 py-3 px-6 rounded-lg font-semibold transition-all shadow-lg"
                          style={{ background: 'linear-gradient(to right, #fad96e, #d97706)', color: '#451a03' }}
                        >
                          ✅ Accept Order
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'rejected')}
                          className="flex-1 min-w-32 py-3 px-6 rounded-lg font-semibold transition-all shadow-lg"
                          style={{ background: 'linear-gradient(to right, #451a03, #1d0e01)', color: '#fad96e', border: `1px solid #fad96e` }}
                        >
                          ❌ Reject Order
                        </button>
                      </div>
                    )}

                    {order.status === 'accepted' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'completed')}
                        className="w-full py-3 px-6 rounded-lg font-semibold transition-all shadow-lg"
                        style={{ background: 'linear-gradient(to right, #fad96e, #d97706)', color: '#451a03' }}
                      >
                        🎉 Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'menu' && (
        <>
          {/* Menu Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold" style={{ color: '#fad96e' }}>Menu Management</h2>
              <p style={{ color: '#d97706' }}>Add, edit, and manage menu items</p>
            </div>
            <button
              onClick={() => setShowAddItem(true)}
              className="px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
              style={{ background: 'linear-gradient(to right, #fad96e, #d97706)', color: '#451a03' }}
            >
              ➕ Add New Item
            </button>
          </div>

          {/* Menu Items Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div key={item._id} className="rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: '#451a03', border: `1px solid #fad96e` }}>
                {/* Item Image */}
                <div className="h-48 flex items-center justify-center relative" style={{ background: 'linear-gradient(to bottom right, #451a03, #1d0e01)' }}>
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl opacity-70" style={{ color: '#fad96e' }}>
                      {getItemEmoji(item.type)}
                    </div>
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#fad96e', color: '#451a03' }}>
                    LE{item.basePrice}
                  </div>
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold`} style={item.available ? { backgroundColor: '#fad96e', color: '#451a03' } : { backgroundColor: '#451a03', color: '#fad96e', border: `1px solid #fad96e` }}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-6" style={{ backgroundColor: '#1d0e01' }}>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#fad96e' }}>{item.name}</h3>
                  <p className="mb-4 text-sm" style={{ color: '#d97706' }}>{item.description}</p>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="flex-1 py-2 px-4 rounded-lg font-semibold transition-all text-sm"
                      style={{ background: 'linear-gradient(to right, #fad96e, #d97706)', color: '#451a03' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="flex-1 py-2 px-4 rounded-lg font-semibold transition-all text-sm"
                      style={{ background: 'linear-gradient(to right, #451a03, #1d0e01)', color: '#fad96e', border: `1px solid #fad96e` }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Item Modal */}
          {showAddItem && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#451a03', border: `1px solid #fad96e` }}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold" style={{ color: '#fad96e' }}>Add New Menu Item</h3>
                    <button
                      onClick={() => setShowAddItem(false)}
                      className="text-2xl"
                      style={{ color: '#fad96e' }}
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold mb-2" style={{ color: '#fad96e' }}>Item Name *</label>
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                        style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                        placeholder="Enter item name"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2" style={{ color: '#fad96e' }}>Type *</label>
                      <select
                        value={newItem.type}
                        onChange={(e) => setNewItem({...newItem, type: e.target.value as any})}
                        className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                        style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                      >
                        <option value="burger" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Burger</option>
                        <option value="liver" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Liver</option>
                        <option value="sausage" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Sausage</option>
                        <option value="kofta" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Kofta</option>
                        <option value="lasagna" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Lasagna</option>
                        <option value="drinks" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Drinks</option>
                        <option value="deserts" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Deserts</option>
                        <option value="appetizers" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>appetizers</option>
                        <option value="Bukhari" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Bukhari</option>
                        <option value="Mandi" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Mandi</option>
                        <option value="Musakhan" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Musakhan</option>

                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-2" style={{ color: '#fad96e' }}>Description *</label>
                      <textarea
                        value={newItem.description}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        className="w-full px-4 py-3 border-2 rounded-lg outline-none h-24 resize-none"
                        style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                        placeholder="Enter item description"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2" style={{ color: '#fad96e' }}>Base Price *</label>
                      <input
                        type="number"
                        value={newItem.basePrice}
                        onChange={(e) => setNewItem({...newItem, basePrice: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                        style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                        placeholder="Enter base price"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2" style={{ color: '#fad96e' }}>Image</label>
                      <input
                        type="file"
                        ref={imageInput}
                        accept="image/*"
                        className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                        style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2" style={{ color: '#fad96e' }}>Customizations</label>
                      {newItem.customizations.map((custom, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                          <input
                            type="text"
                            value={custom.name}
                            onChange={(e) => {
                              const updated = [...newItem.customizations];
                              updated[index].name = e.target.value;
                              setNewItem({...newItem, customizations: updated});
                            }}
                            className="flex-1 px-3 py-2 border-2 rounded-lg outline-none"
                            style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                            placeholder="Customization name"
                          />
                          <input
                            type="number"
                            value={custom.price}
                            onChange={(e) => {
                              const updated = [...newItem.customizations];
                              updated[index].price = parseFloat(e.target.value) || 0;
                              setNewItem({...newItem, customizations: updated});
                            }}
                            className="w-24 px-3 py-2 border-2 rounded-lg outline-none"
                            style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                            placeholder="Price"
                            min="0"
                            step="0.01"
                          />
                          <button
                            onClick={() => removeCustomization(index)}
                            className="px-3 py-2 rounded-lg font-bold"
                            style={{ backgroundColor: '#451a03', color: '#fad96e', border: `1px solid #fad96e` }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addCustomization()}
                        className="font-semibold"
                        style={{ color: '#fad96e' }}
                      >
                        + Add Customization
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => setShowAddItem(false)}
                      className="flex-1 py-3 rounded-lg font-semibold transition-all"
                      style={{ backgroundColor: '#1d0e01', color: '#fad96e', border: `1px solid #fad96e` }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddItem}
                      className="flex-1 py-3 rounded-lg font-semibold transition-all"
                      style={{ background: 'linear-gradient(to right, #fad96e, #d97706)', color: '#451a03' }}
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Item Modal */}
          {editingItem && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#451a03', border: `1px solid #fad96e` }}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold" style={{ color: '#fad96e' }}>Edit Menu Item</h3>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="text-2xl"
                      style={{ color: '#fad96e' }}
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold mb-2" style={{ color: '#fad96e' }}>Item Name *</label>
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                        className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                        style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2" style={{ color: '#fad96e' }}>Type *</label>
                      <select
                        value={editingItem.type}
                        onChange={(e) => setEditingItem({...editingItem, type: e.target.value})}
                        className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                        style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                      >
                        <option value="burger" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Burger</option>
                        <option value="liver" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Liver</option>
                        <option value="sausage" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Sausage</option>
                        <option value="kofta" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Kofta</option>
                        <option value="lasagna" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Lasagna</option>
                        <option value="drinks" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Drinks</option>
                        <option value="deserts" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Deserts</option>
                        <option value="appetizers" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>appetizers</option>
                        <option value="Bukhari" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Bukhari</option>
                        <option value="Mandi" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Mandi</option>
                        <option value="Musakhan" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Musakhan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-2" style={{ color: '#fad96e' }}>Description *</label>
                      <textarea
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                        className="w-full px-4 py-3 border-2 rounded-lg outline-none h-24 resize-none"
                        style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2" style={{ color: '#fad96e' }}>Base Price *</label>
                      <input
                        type="number"
                        value={editingItem.basePrice}
                        onChange={(e) => setEditingItem({...editingItem, basePrice: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                        style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2" style={{ color: '#fad96e' }}>Available</label>
                      <select
                        value={editingItem.available ? 'true' : 'false'}
                        onChange={(e) => setEditingItem({...editingItem, available: e.target.value === 'true'})}
                        className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                        style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                      >
                        <option value="true" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Available</option>
                        <option value="false" style={{ backgroundColor: '#1d0e01', color: '#fad96e' }}>Unavailable</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-2" style={{ color: '#fad96e' }}>Image</label>
                      <input
                        type="file"
                        ref={imageInput}
                        accept="image/*"
                        className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-all"
                        style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                      />
                      {editingItem.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={editingItem.imageUrl} 
                            alt="Current"
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block font-semibold mb-2" style={{ color: '#fad96e' }}>Customizations</label>
                      {editingItem.customizations.map((custom: any, index: number) => (
                        <div key={index} className="flex space-x-2 mb-2">
                          <input
                            type="text"
                            value={custom.name}
                            onChange={(e) => {
                              const updated = [...editingItem.customizations];
                              updated[index].name = e.target.value;
                              setEditingItem({...editingItem, customizations: updated});
                            }}
                            className="flex-1 px-3 py-2 border-2 rounded-lg outline-none"
                            style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                            placeholder="Customization name"
                          />
                          <input
                            type="number"
                            value={custom.price}
                            onChange={(e) => {
                              const updated = [...editingItem.customizations];
                              updated[index].price = parseFloat(e.target.value) || 0;
                              setEditingItem({...editingItem, customizations: updated});
                            }}
                            className="w-24 px-3 py-2 border-2 rounded-lg outline-none"
                            style={{ backgroundColor: '#1d0e01', borderColor: '#fad96e', color: '#fad96e' }}
                            placeholder="Price"
                            min="0"
                            step="0.01"
                          />
                          <button
                            onClick={() => removeCustomization(index, true)}
                            className="px-3 py-2 rounded-lg font-bold"
                            style={{ backgroundColor: '#451a03', color: '#fad96e', border: `1px solid #fad96e` }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addCustomization(true)}
                        className="font-semibold"
                        style={{ color: '#fad96e' }}
                      >
                        + Add Customization
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => setEditingItem(null)}
                      className="flex-1 py-3 rounded-lg font-semibold transition-all"
                      style={{ backgroundColor: '#1d0e01', color: '#fad96e', border: `1px solid #fad96e` }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateItem}
                      className="flex-1 py-3 rounded-lg font-semibold transition-all"
                      style={{ background: 'linear-gradient(to right, #fad96e, #d97706)', color: '#451a03' }}
                    >
                      Update Item
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}