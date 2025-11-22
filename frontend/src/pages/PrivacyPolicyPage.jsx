// pages/PrivacyPolicyPage.jsx
import React from 'react';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <PageHeader
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your personal information"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <div className="mb-8">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> November 21, 2024
            </p>
            <p className="text-gray-700 leading-relaxed">
              At Amour Florals, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from us.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Personal Information</h3>
            <p className="text-gray-700 mb-4">When you make a purchase or create an account, we may collect:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>Name and contact information (email, phone, address)</li>
              <li>Payment information (processed securely through our payment providers)</li>
              <li>Delivery preferences and special instructions</li>
              <li>Account credentials and preferences</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>Browser type and version</li>
              <li>Device information and IP address</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referring website information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Communicate about your orders and deliveries</li>
              <li>Provide customer support</li>
              <li>Send promotional emails (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information Sharing</h2>
            <p className="text-gray-700 mb-4">We do not sell, trade, or rent your personal information. We may share your information with:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Delivery partners to fulfill your orders</li>
              <li>Payment processors to handle transactions</li>
              <li>Service providers who assist with our operations</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Access and update your personal information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cookies</h2>
            <p className="text-gray-700">
              We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@amourflorals.com<br />
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

export default PrivacyPolicyPage;