// src/pages/TermsOfServicePage.jsx
import React from 'react';
import PageHeader from '../components/PageHeader';

const TermsOfServicePage = () => {
  return (
    <>
      <title>Terms of Service - Apna Flar | User Agreement | Legal Terms & Conditions</title>
      <meta name="description" content="Apna Flar Terms of Service - User agreement, legal terms and conditions for using our flower delivery platform. Read our complete terms before placing orders." />
      <meta name="keywords" content="apna flar terms, terms of service, user agreement, legal terms, terms and conditions, flower delivery terms" />
      
      <div className="min-h-screen bg-white pt-20">
        <PageHeader 
          title="Terms of Service" 
          subtitle="User Agreement & Legal Terms for Using Apna Flar Services"
        />
        
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <section className="mb-12">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-blue-800 mb-3">Agreement to Terms</h2>
                <p className="text-blue-700">
                  By accessing and using Apna Flar's website and services, you agree to be bound by these Terms of Service. 
                  These terms constitute a legally binding agreement between you and Apna Flar Private Limited.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Effective Date:</strong> November 2024</p>
                  <p><strong>Last Updated:</strong> November 2024</p>
                </div>
                <div>
                  <p><strong>Governing Law:</strong> Laws of India</p>
                  <p><strong>Jurisdiction:</strong> Courts of Gurugram, Haryana</p>
                </div>
              </div>
            </section>

            {/* Company Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Company Information</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Legal Entity</h3>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li><strong>Company Name:</strong> Apna Flar Private Limited</li>
                      <li><strong>CIN:</strong> U74999HR2024PTC123456</li>
                      <li><strong>GSTIN:</strong> 06ABCDE1234F1Z5</li>
                      <li><strong>Registration:</strong> Registered under Companies Act, 2013</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Registered Address</h3>
                    <p className="text-gray-600 text-sm">
                      Apna Flar Private Limited<br />
                      123 Business Park, Sector 18<br />
                      Gurugram, Haryana 122015<br />
                      India
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Service Description */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Our Services</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">What We Provide</h3>
                  <ul className="text-gray-600 space-y-2 ml-6">
                    <li>• Online flower ordering and delivery platform</li>
                    <li>• Fresh flower arrangements and bouquets</li>
                    <li>• Same-day, next-day, and scheduled delivery services</li>
                    <li>• Custom floral arrangements for special occasions</li>
                    <li>• Corporate and bulk flower orders</li>
                    <li>• Customer support and order tracking</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Service Areas</h3>
                  <p className="text-gray-600">
                    We provide delivery services across India covering 25,000+ PIN codes through our network of 
                    local florists and delivery partners. Service availability may vary by location.
                  </p>
                </div>
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">User Responsibilities</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">✓ You Must:</h3>
                  <ul className="text-green-700 space-y-2 text-sm">
                    <li>• Provide accurate and complete information</li>
                    <li>• Use the service for lawful purposes only</li>
                    <li>• Maintain the security of your account</li>
                    <li>• Pay for orders in full and on time</li>
                    <li>• Provide correct delivery addresses</li>
                    <li>• Respect intellectual property rights</li>
                    <li>• Comply with all applicable laws</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">✗ You Must Not:</h3>
                  <ul className="text-red-700 space-y-2 text-sm">
                    <li>• Use false or misleading information</li>
                    <li>• Attempt to hack or disrupt our systems</li>
                    <li>• Share your account with others</li>
                    <li>• Use the service for illegal activities</li>
                    <li>• Violate any third-party rights</li>
                    <li>• Post harmful or offensive content</li>
                    <li>• Attempt payment fraud or chargebacks</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Orders and Payments */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Orders & Payments</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Order Process</h3>
                  <ol className="text-gray-600 space-y-2 ml-6 list-decimal">
                    <li>Browse and select products from our catalog</li>
                    <li>Add items to cart and proceed to checkout</li>
                    <li>Provide delivery details and select delivery date/time</li>
                    <li>Choose payment method and complete payment</li>
                    <li>Receive order confirmation via SMS and email</li>
                    <li>Track your order through our platform</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Payment Terms</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <ul className="text-yellow-800 space-y-1 text-sm">
                      <li>• All payments must be made in full before delivery</li>
                      <li>• We accept credit cards, debit cards, UPI, net banking, and digital wallets</li>
                      <li>• Payments are processed securely through Razorpay</li>
                      <li>• Prices include applicable taxes (GST)</li>
                      <li>• Delivery charges are additional unless specified otherwise</li>
                      <li>• Failed payments will result in order cancellation</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Order Modifications</h3>
                  <p className="text-gray-600">
                    Orders can be modified or cancelled within specific timeframes as outlined in our 
                    Cancellation & Refund Policy. Once an order enters preparation, modifications may not be possible.
                  </p>
                </div>
              </div>
            </section>

            {/* Delivery Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Delivery Terms</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Delivery Commitment</h3>
                  <p className="text-gray-600 mb-3">
                    We strive to deliver all orders within the promised timeframe. However, delivery times are estimates 
                    and may be affected by factors beyond our control.
                  </p>
                  <ul className="text-gray-600 space-y-1 ml-6">
                    <li>• Weather conditions and natural disasters</li>
                    <li>• Traffic conditions and road closures</li>
                    <li>• Recipient availability and address accuracy</li>
                    <li>• Local restrictions and security protocols</li>
                    <li>• Peak season demand and inventory availability</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Delivery Attempts</h3>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="text-gray-600">
                      We make up to 3 delivery attempts. If delivery cannot be completed after 3 attempts due to 
                      recipient unavailability or incorrect address, the order may be cancelled with applicable charges.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Product Substitution</h3>
                  <p className="text-gray-600">
                    In case of unavailability of specific flowers or products, we reserve the right to substitute 
                    with similar or higher value alternatives while maintaining the overall design and color scheme.
                  </p>
                </div>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Intellectual Property</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Our Rights</h3>
                  <p className="text-gray-600">
                    All content on our platform including text, images, logos, designs, and software is owned by 
                    Apna Flar Private Limited or our licensors and is protected by intellectual property laws.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Your Rights</h3>
                  <p className="text-gray-600">
                    You retain ownership of any content you provide to us (reviews, photos, etc.) but grant us 
                    a license to use such content for business purposes including marketing and promotion.
                  </p>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Limitation of Liability</h2>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-orange-800 mb-3">Important Legal Notice</h3>
                <div className="text-orange-700 space-y-3 text-sm">
                  <p>
                    <strong>Maximum Liability:</strong> Our total liability for any claim related to our services 
                    shall not exceed the amount paid by you for the specific order in question.
                  </p>
                  <p>
                    <strong>Excluded Damages:</strong> We are not liable for indirect, incidental, special, 
                    consequential, or punitive damages including but not limited to loss of profits, data, or business opportunities.
                  </p>
                  <p>
                    <strong>Force Majeure:</strong> We are not liable for delays or failures due to circumstances 
                    beyond our reasonable control including natural disasters, government actions, or technical failures.
                  </p>
                </div>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dispute Resolution</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Resolution Process</h3>
                  <ol className="text-gray-600 space-y-2 ml-6 list-decimal">
                    <li><strong>Direct Communication:</strong> Contact our customer support team first</li>
                    <li><strong>Internal Review:</strong> We will investigate and attempt to resolve the issue</li>
                    <li><strong>Mediation:</strong> If needed, we may engage in mediation</li>
                    <li><strong>Legal Action:</strong> As a last resort, disputes will be resolved through Indian courts</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Jurisdiction</h3>
                  <p className="text-gray-600">
                    Any legal disputes arising from these terms or our services shall be subject to the exclusive 
                    jurisdiction of the courts in Gurugram, Haryana, India.
                  </p>
                </div>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Changes to Terms</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-800 mb-3">Updates and Modifications</h3>
                <p className="text-blue-700 mb-3">
                  We reserve the right to modify these terms at any time. Changes will be effective immediately 
                  upon posting on our website.
                </p>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>• Significant changes will be communicated via email or website notice</li>
                  <li>• Continued use of our services constitutes acceptance of updated terms</li>
                  <li>• You should review these terms periodically</li>
                  <li>• If you disagree with changes, you should discontinue using our services</li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Contact Information</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600 mb-4">
                  For questions about these Terms of Service or any legal matters, please contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Legal Department</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> <a href="mailto:legal@apnaflar.com" className="text-rose-600 hover:text-rose-700">legal@apnaflar.com</a><br />
                      <strong>Phone:</strong> <a href="tel:+919876543210" className="text-rose-600 hover:text-rose-700">+91 98765 43210</a>
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Registered Office</h4>
                    <p className="text-sm text-gray-600">
                      Apna Flar Private Limited<br />
                      123 Business Park, Sector 18<br />
                      Gurugram, Haryana 122015<br />
                      India
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="text-sm text-gray-500 border-t pt-6">
              <p>Last updated: November 2024</p>
              <p>These terms of service are governed by the laws of India and are subject to the jurisdiction of Gurugram courts.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfServicePage;