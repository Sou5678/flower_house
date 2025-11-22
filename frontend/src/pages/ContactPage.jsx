// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Here you would typically send the form data to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <title>Contact Us - Apna Flar | 24/7 Customer Support | Fresh Flower Delivery</title>
      <meta name="description" content="Contact Apna Flar for fresh flower delivery support. 24/7 customer service, WhatsApp support +91 98765 43210. Get help with orders, delivery, and custom arrangements." />
      <meta name="keywords" content="contact apna flar, customer support, flower delivery help, order support, fresh flowers contact" />
      
      <div className="min-h-screen bg-white pt-20">
        <PageHeader 
          title="Contact Us" 
          subtitle="24/7 Customer Support for All Your Floral Needs"
        />
      
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Have questions about our flowers, need help with an order, or want to discuss custom arrangements? 
              We're here to help make your floral experience perfect.
            </p>

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-start">
                <div className="bg-rose-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Customer Support</h3>
                  <p className="text-gray-600">+91 98765 43210</p>
                  <p className="text-sm text-gray-500">Available 24/7 for urgent orders</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start">
                <div className="bg-rose-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Email Support</h3>
                  <p className="text-gray-600">support@apnaflar.com</p>
                  <p className="text-sm text-gray-500">Response within 2-4 hours</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start">
                <div className="bg-rose-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Business Address</h3>
                  <p className="text-gray-600">Apna Flar Pvt Ltd<br />123 Business Park, Sector 18<br />Gurugram, Haryana 122015</p>
                  <p className="text-sm text-gray-500">Registered Office Address</p>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4">Business Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Company:</span>
                  <span className="text-gray-600 ml-2">Apna Flar Private Limited</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">CIN:</span>
                  <span className="text-gray-600 ml-2">U74999HR2024PTC123456</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">GSTIN:</span>
                  <span className="text-gray-600 ml-2">06ABCDE1234F1Z5</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Support Hours:</span>
                  <span className="text-gray-600 ml-2">24/7 Customer Support</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Delivery:</span>
                  <span className="text-gray-600 ml-2">Pan India Delivery Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send us a Message</h2>
            
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                Thank you for your message! We'll get back to you within 24 hours.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                Sorry, there was an error sending your message. Please try again or call us directly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="">Select a subject</option>
                  <option value="order-support">Order Support & Tracking</option>
                  <option value="delivery-inquiry">Delivery Inquiry</option>
                  <option value="payment-issue">Payment & Billing Issue</option>
                  <option value="custom-arrangement">Custom Flower Arrangements</option>
                  <option value="bulk-order">Bulk/Corporate Orders</option>
                  <option value="refund-request">Refund & Cancellation</option>
                  <option value="quality-concern">Quality Concern</option>
                  <option value="partnership">Business Partnership</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ContactPage;