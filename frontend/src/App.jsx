import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, lazy, Suspense, memo } from "react";
import "./App.css";
import authUtils from './utils/auth';
// Remove performance monitoring for now to fix immediate errors
// import { PerformanceMonitor as PM, CleanupManager } from './config/performance';

// Lazy load pages for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const FlowerCarePage = lazy(() => import('./pages/FlowerCarePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ShippingPolicyPage = lazy(() => import('./pages/ShippingPolicyPage'));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));

// Lazy load admin components
const AdminRoute = lazy(() => import('./admin/components/common/AdminRoute'));
const AdminLayout = lazy(() => import('./admin/components/common/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminTestPage = lazy(() => import('./pages/AdminTestPage'));
const CompleteAdminDashboard = lazy(() => import('./pages/CompleteAdminDashboard'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));

// Components (keep Nav and Contact eager loaded for better UX)
import Nav from "./components/Nav";
import ErrorBoundary from "./components/ErrorBoundary";
const Contact = lazy(() => import('./components/Contact'));
// const PerformanceMonitor = lazy(() => import('./components/PerformanceMonitor'));

// Contexts
import { WishlistProvider, useWishlist } from './contexts/WishlistContext';
const AdminProvider = lazy(() => import('./admin/contexts/AdminContext').then(module => ({ default: module.AdminProvider })));

// Utilities
import { ScrollToTop } from './utils/scrollToTop';

// Loading component for better UX
const PageLoader = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
    <div className="text-center">
      {/* Apna Flar Logo with Animation */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-rose-600 mb-2">
          <span className="text-rose-600">Apna</span>
          <span className="text-pink-600 ml-2 font-script">Flar</span>
        </h1>
        <p className="text-gray-600 text-sm">Fresh Flowers, Delivered with Love</p>
      </div>
      
      {/* Enhanced Loading Animation */}
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-200 border-t-rose-600 mx-auto mb-4"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse">
            <svg className="w-6 h-6 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <p className="text-gray-600 font-medium animate-pulse">Loading your floral experience...</p>
      
      {/* Loading Tips */}
      <div className="mt-6 max-w-md mx-auto">
        <p className="text-xs text-gray-500">
          💡 Did you know? Fresh flowers can improve your mood and reduce stress!
        </p>
      </div>
    </div>
  </div>
));

PageLoader.displayName = 'PageLoader';

const AppContent = memo(() => {
  const { fetchWishlist } = useWishlist();

  // Initialize wishlist from backend on app load for authenticated users
  useEffect(() => {
    if (authUtils.isAuthenticated()) {
      fetchWishlist();
    }
  }, [fetchWishlist]);

  return (
    <div className="App">
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin-test" element={
          <Suspense fallback={<PageLoader />}>
            <AdminTestPage />
          </Suspense>
        } />
        
        <Route path="/admin-complete" element={
          <Suspense fallback={<PageLoader />}>
            <CompleteAdminDashboard />
          </Suspense>
        } />
        
        <Route path="/admin/*" element={
          <Suspense fallback={<PageLoader />}>
            <AdminRoute>
              <Suspense fallback={<PageLoader />}>
                <AdminProvider>
                  <AdminLayout>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      {/* Additional admin routes will be added in future tasks */}
                    </Routes>
                  </AdminLayout>
                </AdminProvider>
              </Suspense>
            </AdminRoute>
          </Suspense>
        } />
        
        {/* Public Routes */}
        <Route path="/*" element={
          <>
            <Nav />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/collections" element={<CollectionsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:productId" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/faqs" element={<FAQPage />} />
                <Route path="/care" element={<FlowerCarePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/contact-old" element={<Contact />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/shipping" element={<ShippingPolicyPage />} />
                <Route path="/refunds" element={<RefundPolicyPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/cookies" element={<CookiePolicyPage />} />
              </Routes>
            </Suspense>
          </>
        } />
      </Routes>
    </div>
  );
});

AppContent.displayName = 'AppContent';

function App() {
  useEffect(() => {
    // Performance monitoring disabled for now
    // PM.startMeasure('app-initialization');
    
    // Cleanup function
    return () => {
      // PM.endMeasure('app-initialization');
      // CleanupManager.cleanup();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <WishlistProvider>
          <AppContent />
          {/* Performance Monitor disabled for now */}
          {/* <Suspense fallback={null}>
            <PerformanceMonitor />
          </Suspense> */}
        </WishlistProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;