import { useState } from 'react';
import loadRazorpay from '../config/razorpay';
import API from '../utils/api';

const CheckoutForm = ({ orderData, shippingAddress, onSuccess, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handlePayment = async () => {
    setIsProcessing(true);
    setMessage('');

    try {
      // Load Razorpay script
      const isRazorpayLoaded = await loadRazorpay();
      
      if (!isRazorpayLoaded) {
        setMessage('Failed to load payment gateway. Please try again.');
        return;
      }

      // Create Razorpay order
      const response = await API.post('/api/payments/create-order', {
        amount: orderData.totalAmount || orderData.total,
        orderId: orderData._id,
        currency: 'INR'
      });

      const { razorpayOrderId, amount, currency, key, order } = response.data.data;

      // Razorpay options
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'Amour Florals',
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: order.customerName,
          email: order.customerEmail,
          contact: order.customerPhone
        },
        notes: {
          address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}`
        },
        theme: {
          color: '#ec4899'
        },
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await API.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData._id
            });

            onSuccess({
              paymentId: response.razorpay_payment_id,
              orderId: orderData._id,
              order: verifyResponse.data.data.order
            });
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            setMessage('Payment verification failed. Please contact support.');
            onError(verifyError.message);
          }
        },
        modal: {
          ondismiss: function() {
            setMessage('Payment cancelled by user');
            setIsProcessing(false);
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error('Payment error:', err);
      setMessage('Failed to initialize payment. Please try again.');
      onError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Payment Method
        </label>
        <div className="bg-gray-50 rounded-md p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
              <span className="ml-2 text-sm font-medium text-gray-700">Credit/Debit Card</span>
            </div>
            <div className="flex items-center">
              <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="ml-2 text-sm font-medium text-gray-700">UPI</span>
            </div>
            <div className="flex items-center">
              <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="ml-2 text-sm font-medium text-gray-700">Net Banking</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Secure payment powered by Razorpay
          </p>
        </div>
      </div>

      {/* Order Total */}
      <div className="bg-gray-50 rounded-md p-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total Amount:</span>
          <span className="text-rose-600">
            ${(orderData.totalAmount || orderData.total).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {message && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handlePayment}
        disabled={isProcessing}
        className={`w-full py-3 px-4 rounded-md font-medium transition duration-300 ${
          isProcessing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-rose-600 text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          `Pay ₹${(orderData.totalAmount || orderData.total).toFixed(2)}`
        )}
      </button>

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-500">
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Your payment information is secure and encrypted by Razorpay</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;