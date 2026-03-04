import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface OrderHistoryProps {
  onBack: () => void;
}

export function OrderHistory({ onBack }: OrderHistoryProps) {
  const orders = useQuery(api.orders.getUserOrders);

  if (!orders) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#facc15', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#d97706', color: '#1d0e01' };
      case 'accepted':
        return { backgroundColor: '#facc15', color: '#451a03' };
      case 'rejected':
        return { backgroundColor: '#451a03', color: '#facc15', border: `1px solid #facc15` };
      case 'completed':
        return { backgroundColor: '#1d0e01', color: '#facc15', border: `1px solid #d97706` };
      default:
        return { backgroundColor: '#451a03', color: '#facc15' };
    }
  };

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
          <span>Back to Home</span>
        </button>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold" style={{ color: '#facc15' }}>Order History</h1>
          <p style={{ color: '#d97706' }}>Track your royal orders</p>
        </div>

        <div></div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#facc15' }}>No Orders Yet</h3>
            <p style={{ color: '#d97706' }}>You haven't placed any orders yet. Start exploring our royal menu!</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: '#451a03', border: `1px solid #facc15` }}>
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-bold" style={{ color: '#facc15' }}>
                        {order.orderType === 'delivery' ? '🛸 Delivery Order' : '👑 Catering Service'}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold" style={getStatusStyle(order.status)}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm" style={{ color: '#d97706' }}>
                      {new Date(order._creationTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: '#facc15' }}>${order.totalAmount.toFixed(2)}</div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="rounded-lg p-4" style={{ backgroundColor: '#1d0e01' }}>
                  {order.orderType === 'delivery' && order.items && (
                    <div>
                      <h4 className="font-semibold mb-3" style={{ color: '#facc15' }}>Items Ordered</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium" style={{ color: '#facc15' }}>{item.name}</div>
                              <div className="text-sm" style={{ color: '#d97706' }}>Quantity: {item.quantity}</div>
                              {item.customizations.length > 0 && (
                                <div className="text-xs" style={{ color: '#d97706' }}>
                                  Customizations: {item.customizations.join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="font-semibold" style={{ color: '#facc15' }}>${item.price.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {order.orderType === 'catering' && (
                    <div>
                      <h4 className="font-semibold mb-3" style={{ color: '#facc15' }}>Event Details</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div><strong style={{ color: '#facc15' }}>Event Date:</strong> <span style={{ color: '#d97706' }}>{order.eventDate}</span></div>
                          <div><strong style={{ color: '#facc15' }}>Location:</strong> <span style={{ color: '#d97706' }}>{order.eventLocation}</span></div>
                          <div><strong style={{ color: '#facc15' }}>Guests:</strong> <span style={{ color: '#d97706' }}>{order.guestCount}</span></div>
                        </div>
                        {order.cateringItems && (
                          <div>
                            <strong style={{ color: '#facc15' }}>Catering Items:</strong>
                            {order.cateringItems.map((item, index) => (
                              <div key={index} className="ml-2" style={{ color: '#d97706' }}>
                                {item.item}: {item.quantity} servings
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {order.notes && (
                  <div className="mt-4 rounded-lg p-4" style={{ backgroundColor: '#1d0e01' }}>
                    <h4 className="font-semibold mb-2" style={{ color: '#facc15' }}>Special Notes</h4>
                    <p className="text-sm" style={{ color: '#d97706' }}>{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}