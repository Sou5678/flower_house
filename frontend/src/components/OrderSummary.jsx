const OrderSummary = ({ order }) => {
  if (!order) return null;

  const calculateSubtotal = () => {
    return order.items?.reduce((total, item) => {
      const itemPrice = item.price || 0;
      const sizePrice = item.size?.price || 0;
      const vasePrice = item.vase?.price || 0;
      return total + ((itemPrice + sizePrice + vasePrice) * item.quantity);
    }, 0) || 0;
  };

  const subtotal = order.subtotal || calculateSubtotal();
  const shipping = order.shippingFee || 0;
  const tax = order.tax || (subtotal * 0.08); // 8% tax
  const discount = order.discount || 0;
  const total = order.totalAmount || order.total || (subtotal + shipping + tax - discount);

  return (
    <div className="space-y-4">
      {/* Order Items */}
      <div className="space-y-3">
        {order.items?.map((item, index) => (
          <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-200 last:border-b-0">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </h4>
              
              {/* Size Selection */}
              {item.size && (
                <p className="text-xs text-gray-600">
                  Size: {item.size.name} (+${item.size.price?.toFixed(2)})
                </p>
              )}
              
              {/* Vase Selection */}
              {item.vase && (
                <p className="text-xs text-gray-600">
                  Vase: {item.vase.name} (+${item.vase.price?.toFixed(2)})
                </p>
              )}
              
              {/* Personal Note */}
              {item.personalNote && (
                <p className="text-xs text-gray-600 italic">
                  Note: {item.personalNote}
                </p>
              )}
              
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                <span className="text-sm font-medium text-gray-900">
                  ${((item.price + (item.size?.price || 0) + (item.vase?.price || 0)) * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Totals */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">${tax.toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-green-600">-${discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
          <span className="text-gray-900">Total</span>
          <span className="text-rose-600">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Order Info */}
      {order.orderNumber && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p><strong>Order Number:</strong> {order.orderNumber}</p>
            {order.estimatedDelivery && (
              <p><strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      )}

      {/* Shipping Method */}
      <div className="bg-gray-50 rounded-md p-3">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Method</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="shipping"
              value="standard"
              defaultChecked
              className="text-rose-600 focus:ring-rose-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Standard Delivery (5-7 business days) - Free
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="shipping"
              value="express"
              className="text-rose-600 focus:ring-rose-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Express Delivery (2-3 business days) - $15.00
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="shipping"
              value="same-day"
              className="text-rose-600 focus:ring-rose-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Same Day Delivery - $25.00
            </span>
          </label>
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Secure SSL Encrypted Checkout</span>
      </div>
    </div>
  );
};

export default OrderSummary;