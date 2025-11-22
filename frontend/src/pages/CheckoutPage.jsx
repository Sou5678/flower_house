import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Removed Stripe imports - using Razorpay now
import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';
import AddressForm from '../components/AddressForm';
import authUtils from '../utils/auth';
import API from '../utils/api';

const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      navigate('/login', { state: { from: location } });
      return;
    }

    // Get order data from location state or create from cart
    const orderFromState = location.state?.orderData;
    if (orderFromState) {
      setOrderData(orderFromState);
      createPaymentIntent(orderFromState);
    } else {
      // Create order from cart
      createOrderFromCart();
    }
  }, [navigate, location]);

  const createOrderFromCart = async () => {
    try {
      setLoading(true);
      const cart = JSON.parse(localStorage.getItem('amourFloralsCart') || '[]');
      
      if (cart.length === 0) {
        navigate('/cart');
        return;
      }

      // Create order
      const response = await API.post('/api/orders', {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          size: item.selectedSize,
          vase: item.selectedVase,
          personalNote: item.personalNote
        })),
        shippingAddress: shippingAddress
      });

      const newOrder = response.data.data;
      setOrderData(newOrder);
      await createPaymentIntent(newOrder);
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const createPaymentIntent = async (order) => {
    try {
      // For Razorpay, we don't need to create payment intent upfront
      // Payment order is created when user clicks pay button
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const handleAddressSubmit = (address) => {
    setShippingAddress(address);
    setCurrentStep(2);
  };

  const handlePaymentSuccess = (paymentData) => {
    // Clear cart
    localStorage.removeItem('amourFloralsCart');
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Navigate to success page
    navigate('/order-confirmation', {
      state: {
        orderId: paymentData.orderId,
        paymentId: paymentData.paymentId,
        order: paymentData.order
      }
    });
  };

  // Razorpay doesn't need options like Stripe

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Checkout Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 transition duration-300"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-rose-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-rose-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="ml-2 font-medium">Shipping</span>
              </div>
              <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-rose-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${currentStep >= 2 ? 'text-rose-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-rose-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">Payment</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>
                <AddressForm
                  initialAddress={shippingAddress}
                  onSubmit={handleAddressSubmit}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
                <CheckoutForm
                  orderData={orderData}
                  shippingAddress={shippingAddress}
                  onSuccess={handlePaymentSuccess}
                  onError={setError}
                />
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            {orderData && <OrderSummary order={orderData} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;