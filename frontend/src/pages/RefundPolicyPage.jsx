// src/pages/RefundPolicyPage.jsx
import React from 'react';
import PageHeader from '../components/PageHeader';

const RefundPolicyPage = () => {
  return (
    <>
      <title>Refund & Cancellation Policy - Apna Flar | 100% Satisfaction Guarantee</title>
      <meta name="description" content="Apna Flar refund policy - 100% satisfaction guarantee, easy cancellation process, instant refunds to UPI/wallets. Fair and transparent return policy for fresh flowers." />
      <meta name="keywords" content="apna flar refund, cancellation policy, return policy, satisfaction guarantee, instant refund, flower return" />
      
      <div className="min-h-screen bg-white pt-20">
        <PageHeader 
          title="Refund & Cancellation Policy" 
          subtitle="100% Satisfaction Guarantee | Easy Returns & Instant Refunds"
        />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          
          {/* Our Guarantee */}
          <section className="mb-12">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-green-800 mb-4">Our 100% Satisfaction Guarantee</h2>
              <p className="text-green-700 text-lg">
                We stand behind the quality of our flowers and service. If you're not completely satisfied 
                with your order, we'll make it right with a replacement, credit, or full refund.
              </p>
            </div>
          </section>

          {/* Cancellation Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Cancellation Policy</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Before Processing (Full Refund)</h3>
                <p className="text-gray-600 mb-3">
                  Orders can be cancelled for a full refund if cancelled before we begin processing:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Same-day orders: Cancel within 2 hours of placing order</li>
                  <li>• Next-day orders: Cancel by 8:00 PM the day before delivery</li>
                  <li>• Scheduled orders: Cancel up to 24 hours before delivery date</li>
                  <li>• Subscription orders: Cancel anytime before next delivery</li>
                </ul>
              </div>

              <div className="border-l-4 border-yellow-500 pl-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">After Processing (Partial Refund)</h3>
                <p className="text-gray-600 mb-3">
                  If your order is already being prepared, cancellation options include:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• 75% refund if cancelled before delivery dispatch</li>
                  <li>• 50% refund if cancelled after dispatch but before delivery</li>
                  <li>• Store credit option available for future purchases</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">After Delivery</h3>
                <p className="text-gray-600">
                  Once flowers are delivered and accepted, cancellations are not available. 
                  However, our satisfaction guarantee still applies for quality issues.
                </p>
              </div>
            </div>
          </section>

          {/* Refund Eligibility */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Refund Eligibility</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">✓ Eligible for Full Refund</h3>
                <ul className="text-green-700 space-y-2 text-sm">
                  <li>• Flowers arrived wilted or damaged</li>
                  <li>• Wrong flowers or arrangement delivered</li>
                  <li>• Delivery failed without notification</li>
                  <li>• Significant delay beyond promised time</li>
                  <li>• Order cancelled within allowed timeframe</li>
                  <li>• Recipient refused delivery due to our error</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-3">✗ Not Eligible for Refund</h3>
                <ul className="text-red-700 space-y-2 text-sm">
                  <li>• Natural flower wilting after 3+ days</li>
                  <li>• Recipient was not available (after 3 attempts)</li>
                  <li>• Incorrect delivery address provided</li>
                  <li>• Change of mind after successful delivery</li>
                  <li>• Flowers damaged due to recipient's care</li>
                  <li>• Seasonal flower substitutions (when noted)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Refund Process */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">How to Request a Refund</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-rose-100 rounded-full p-2 mr-4 mt-1">
                  <span className="text-rose-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Contact Us Immediately</h3>
                  <p className="text-gray-600">
                    Report any issues within 24 hours of delivery. Contact us by phone, email, or through your account.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-rose-100 rounded-full p-2 mr-4 mt-1">
                  <span className="text-rose-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Provide Details</h3>
                  <p className="text-gray-600">
                    Share your order number, photos of the issue (if applicable), and a description of the problem.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-rose-100 rounded-full p-2 mr-4 mt-1">
                  <span className="text-rose-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">We'll Investigate</h3>
                  <p className="text-gray-600">
                    Our team will review your case and may contact the recipient or delivery partner for additional information.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-rose-100 rounded-full p-2 mr-4 mt-1">
                  <span className="text-rose-600 font-semibold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Resolution</h3>
                  <p className="text-gray-600">
                    We'll offer a replacement, store credit, or refund based on our findings. Most cases are resolved within 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Refund Methods */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Refund Methods & Timing</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left">Payment Method</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Refund Method</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Processing Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">Credit/Debit Card</td>
                    <td className="border border-gray-300 px-4 py-3">Original card</td>
                    <td className="border border-gray-300 px-4 py-3">5-7 business days</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">UPI/Digital Wallets</td>
                    <td className="border border-gray-300 px-4 py-3">Original payment method</td>
                    <td className="border border-gray-300 px-4 py-3">1-3 business days</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">Net Banking</td>
                    <td className="border border-gray-300 px-4 py-3">Original bank account</td>
                    <td className="border border-gray-300 px-4 py-3">5-7 business days</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">Razorpay Wallet</td>
                    <td className="border border-gray-300 px-4 py-3">Wallet balance</td>
                    <td className="border border-gray-300 px-4 py-3">Instant</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">Store Credit</td>
                    <td className="border border-gray-300 px-4 py-3">Account balance</td>
                    <td className="border border-gray-300 px-4 py-3">Immediate</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 font-medium mb-2">Important Notes:</p>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Refund timing may vary depending on your bank or payment provider's processing times</li>
                <li>• All refunds are processed through Razorpay's secure payment gateway</li>
                <li>• You will receive SMS and email confirmation once refund is initiated</li>
                <li>• For UPI refunds, amount is credited instantly to your UPI ID</li>
                <li>• Credit card refunds may take 5-7 working days to reflect in your statement</li>
              </ul>
            </div>
          </section>

          {/* Special Circumstances */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Special Circumstances</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Weather-Related Issues</h3>
                <p className="text-gray-600">
                  If severe weather prevents delivery, we'll automatically reschedule at no charge or offer a full refund if rescheduling isn't suitable.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Hospital/Funeral Restrictions</h3>
                <p className="text-gray-600">
                  If delivery is refused due to hospital policies or funeral home restrictions we weren't informed of, we'll offer alternative delivery or full refund.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Seasonal Flower Substitutions</h3>
                <p className="text-gray-600">
                  When specific flowers are unavailable, we substitute with similar or higher-value alternatives. If you're unsatisfied with substitutions, contact us for resolution.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Bulk/Corporate Orders</h3>
                <p className="text-gray-600">
                  Large orders (10+ arrangements) have custom cancellation terms discussed at time of order. Contact our corporate team for specific policies.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Need Help?</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                Our customer service team is ready to help resolve any issues with your order.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Phone Support</h4>
                  <p className="text-sm text-gray-600">
                    <a href="tel:+919876543210" className="text-rose-600 hover:text-rose-700">+91 98765 43210</a><br />
                    24/7 Customer Support<br />
                    Toll-free support
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">WhatsApp & Email</h4>
                  <p className="text-sm text-gray-600">
                    <a href="https://wa.me/919876543210" className="text-rose-600 hover:text-rose-700">WhatsApp: +91 98765 43210</a><br />
                    <a href="mailto:support@apnaflar.com" className="text-rose-600 hover:text-rose-700">support@apnaflar.com</a><br />
                    Response within 2-4 hours
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Live Chat</h4>
                  <p className="text-sm text-gray-600">
                    Available on our website<br />
                    24/7 Live Chat Support<br />
                    Instant assistance
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="text-sm text-gray-500 border-t pt-6">
            <p>Last updated: November 2024</p>
            <p>This refund policy is subject to change. Please check this page regularly for updates.</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default RefundPolicyPage;