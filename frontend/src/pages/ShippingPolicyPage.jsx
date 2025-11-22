// src/pages/ShippingPolicyPage.jsx
import React from 'react';
import PageHeader from '../components/PageHeader';

const ShippingPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <PageHeader 
        title="Shipping Policy" 
        subtitle="Everything you need to know about our delivery services"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          
          {/* Delivery Areas */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Delivery Areas</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-green-800 mb-3">We Deliver To:</h3>
              <ul className="text-green-700 space-y-2">
                <li>• All major cities and metropolitan areas</li>
                <li>• Suburban areas within 50 miles of city centers</li>
                <li>• Selected rural areas (additional charges may apply)</li>
                <li>• Hospitals, funeral homes, and event venues</li>
              </ul>
            </div>
            <p className="text-gray-600">
              Enter your ZIP code at checkout to confirm delivery availability and see exact delivery times for your area.
            </p>
          </section>

          {/* Delivery Options */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Delivery Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Same-Day Delivery</h3>
                <p className="text-gray-600 mb-3">Perfect for last-minute occasions</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Order by 2:00 PM for same-day delivery</li>
                  <li>• Available Monday-Saturday</li>
                  <li>• Delivery between 12:00 PM - 8:00 PM</li>
                  <li>• Additional $15 fee</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Next-Day Delivery</h3>
                <p className="text-gray-600 mb-3">Our most popular option</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Order by 6:00 PM for next-day delivery</li>
                  <li>• Available 7 days a week</li>
                  <li>• Delivery between 9:00 AM - 6:00 PM</li>
                  <li>• Free on orders over $75</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Scheduled Delivery</h3>
                <p className="text-gray-600 mb-3">Plan ahead for special dates</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Choose your preferred date up to 30 days ahead</li>
                  <li>• Available 7 days a week</li>
                  <li>• 2-hour delivery windows available</li>
                  <li>• Standard delivery fee applies</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Express Delivery</h3>
                <p className="text-gray-600 mb-3">For urgent deliveries</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 2-4 hour delivery window</li>
                  <li>• Available Monday-Friday until 4:00 PM</li>
                  <li>• Real-time tracking included</li>
                  <li>• Additional $25 fee</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Delivery Fees */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Delivery Fees</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left">Delivery Type</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Fee</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Free Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">Standard Delivery</td>
                    <td className="border border-gray-300 px-4 py-3">$12.99</td>
                    <td className="border border-gray-300 px-4 py-3">Orders over $75</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">Same-Day Delivery</td>
                    <td className="border border-gray-300 px-4 py-3">$27.99</td>
                    <td className="border border-gray-300 px-4 py-3">Orders over $150</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">Express Delivery</td>
                    <td className="border border-gray-300 px-4 py-3">$37.99</td>
                    <td className="border border-gray-300 px-4 py-3">Orders over $200</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">Rural Areas</td>
                    <td className="border border-gray-300 px-4 py-3">+$10.00</td>
                    <td className="border border-gray-300 px-4 py-3">No free threshold</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Special Delivery Instructions */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Special Delivery Instructions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Hospital Deliveries</h3>
                <p className="text-gray-600">
                  We deliver to all major hospitals. Please provide the patient's full name, room number, 
                  and hospital name. Some hospitals have restrictions on flower deliveries to certain wards.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Funeral Home Deliveries</h3>
                <p className="text-gray-600">
                  For funeral services, please provide the deceased's name, service date and time, 
                  and funeral home details. We recommend ordering at least 24 hours in advance.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Business Deliveries</h3>
                <p className="text-gray-600">
                  Office deliveries are made during business hours (9 AM - 5 PM). Please provide 
                  the recipient's full name, company name, and floor/suite number if applicable.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Apartment/Condo Deliveries</h3>
                <p className="text-gray-600">
                  Please provide building access codes, apartment numbers, and any special instructions. 
                  If the recipient is not available, we'll leave flowers with building management when possible.
                </p>
              </div>
            </div>
          </section>

          {/* Delivery Guarantee */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Our Delivery Guarantee</h2>
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-rose-800 mb-3">We Promise:</h3>
              <ul className="text-rose-700 space-y-2">
                <li>• Fresh flowers delivered in perfect condition</li>
                <li>• On-time delivery within your selected window</li>
                <li>• Professional and courteous delivery service</li>
                <li>• Photo confirmation of delivery (when requested)</li>
                <li>• Full refund if we fail to meet our delivery promise</li>
              </ul>
            </div>
          </section>

          {/* Weather Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Weather & Emergency Policy</h2>
            <p className="text-gray-600 mb-4">
              We monitor weather conditions closely to ensure the quality of our flowers during delivery:
            </p>
            <ul className="text-gray-600 space-y-2 ml-6">
              <li>• Extreme weather may cause delivery delays for flower safety</li>
              <li>• We'll contact you if weather affects your delivery</li>
              <li>• Alternative delivery dates offered at no extra charge</li>
              <li>• Emergency deliveries available for critical occasions</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Questions About Delivery?</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                Our customer service team is here to help with any delivery questions or special requests.
              </p>
              <div className="space-y-2">
                <p><strong>Phone:</strong> <a href="tel:+15551234567" className="text-rose-600 hover:text-rose-700">+1 (555) 123-4567</a></p>
                <p><strong>Email:</strong> <a href="mailto:delivery@apnaflar.com" className="text-rose-600 hover:text-rose-700">delivery@apnaflar.com</a></p>
                <p><strong>Hours:</strong> Monday-Friday 8 AM - 8 PM, Saturday-Sunday 9 AM - 6 PM</p>
              </div>
            </div>
          </section>

          <div className="text-sm text-gray-500 border-t pt-6">
            <p>Last updated: November 2024</p>
            <p>This shipping policy is subject to change. Please check this page regularly for updates.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;