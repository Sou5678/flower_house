// pages/TermsOfServicePage.jsx
import React from 'react';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <PageHeader
        title="Terms of Service"
        subtitle="Terms and conditions for using our services"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <div className="mb-8">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> November 21, 2024
            </p>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Amour Florals. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our services, you agree to be bound by these Terms.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Products and Services</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Product Descriptions</h3>
            <p className="text-gray-700 mb-4">
              We strive to provide accurate descriptions and images of our floral arrangements. However, due to the natural variation in flowers and seasonal availability, actual products may vary slightly from images shown.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Availability</h3>
            <p className="text-gray-700 mb-4">
              All products are subject to availability. We reserve the right to discontinue any product at any time. In case of unavailability, we will contact you to offer suitable alternatives.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Orders and Payment</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Order Acceptance</h3>
            <p className="text-gray-700 mb-4">
              Your receipt of an electronic or other form of order confirmation does not signify our acceptance of your order. We reserve the right to accept or decline your order for any reason.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Pricing</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>All prices are in USD and subject to change without notice</li>
              <li>Delivery charges are additional and will be calculated at checkout</li>
              <li>We reserve the right to correct pricing errors</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Payment</h3>
            <p className="text-gray-700 mb-4">
              Payment is required at the time of order placement. We accept major credit cards and other payment methods as displayed on our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Delivery</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Delivery Areas</h3>
            <p className="text-gray-700 mb-4">
              We deliver within specified areas as indicated on our website. Delivery charges vary by location and will be displayed at checkout.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Delivery Times</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Same-day delivery available for orders placed before 2 PM</li>
              <li>Delivery times are estimates and may vary due to weather or other circumstances</li>
              <li>We will attempt delivery during business hours unless otherwise specified</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Delivery Issues</h3>
            <p className="text-gray-700 mb-4">
              If the recipient is not available, we may leave the arrangement in a safe location or with a neighbor. We are not responsible for arrangements left unattended at the recipient's request.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Returns and Refunds</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Satisfaction Guarantee</h3>
            <p className="text-gray-700 mb-4">
              We stand behind the quality of our products. If you are not satisfied with your purchase, please contact us within 24 hours of delivery.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Refund Policy</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Refunds may be issued for damaged or significantly different products</li>
              <li>Custom arrangements are non-refundable unless damaged</li>
              <li>Refunds will be processed to the original payment method</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Conduct</h2>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Use our services for any unlawful purpose</li>
              <li>Interfere with or disrupt our services</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Submit false or misleading information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700">
              Our liability is limited to the purchase price of the product. We are not liable for any indirect, incidental, or consequential damages arising from the use of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@amourflorals.com<br />
                <strong>Phone:</strong> (555) 123-4567<br />
                <strong>Address:</strong> 123 Flower Street, Garden City, GC 12345
              </p>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;