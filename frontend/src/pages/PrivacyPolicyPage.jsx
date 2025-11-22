// src/pages/PrivacyPolicyPage.jsx
import React from 'react';
import PageHeader from '../components/PageHeader';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <PageHeader 
        title="Privacy Policy" 
        subtitle="How we collect, use, and protect your personal information"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          
          {/* Introduction */}
          <section className="mb-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">Your Privacy Matters</h2>
              <p className="text-blue-700">
                At Apna Flar, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This policy explains how we collect, use, and safeguard your data when you use our services.
              </p>
            </div>
            <p className="text-gray-600">
              <strong>Effective Date:</strong> November 2024<br />
              <strong>Last Updated:</strong> November 2024
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Information We Collect</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Personal Information You Provide</h3>
                <p className="text-gray-600 mb-3">When you use our services, you may provide us with:</p>
                <ul className="text-gray-600 space-y-1 ml-6">
                  <li>• <strong>Account Information:</strong> Name, email address, phone number, password</li>
                  <li>• <strong>Delivery Information:</strong> Recipient names, addresses, delivery instructions</li>
                  <li>• <strong>Payment Information:</strong> Credit card details, billing address (processed securely)</li>
                  <li>• <strong>Communication Data:</strong> Messages, reviews, customer service interactions</li>
                  <li>• <strong>Preferences:</strong> Flower preferences, occasion reminders, marketing preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Information We Collect Automatically</h3>
                <p className="text-gray-600 mb-3">When you visit our website or use our app, we automatically collect:</p>
                <ul className="text-gray-600 space-y-1 ml-6">
                  <li>• <strong>Device Information:</strong> IP address, browser type, operating system</li>
                  <li>• <strong>Usage Data:</strong> Pages visited, time spent, click patterns, search queries</li>
                  <li>• <strong>Location Data:</strong> General location for delivery services (with permission)</li>
                  <li>• <strong>Cookies & Tracking:</strong> Website preferences, shopping cart contents, analytics data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Information from Third Parties</h3>
                <p className="text-gray-600 mb-3">We may receive information from:</p>
                <ul className="text-gray-600 space-y-1 ml-6">
                  <li>• <strong>Payment Processors:</strong> Transaction verification and fraud prevention</li>
                  <li>• <strong>Delivery Partners:</strong> Delivery status and confirmation</li>
                  <li>• <strong>Social Media:</strong> If you connect your social accounts (optional)</li>
                  <li>• <strong>Marketing Partners:</strong> Aggregated demographic and interest data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">How We Use Your Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Service Delivery</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• Process and fulfill your orders</li>
                  <li>• Coordinate deliveries and send updates</li>
                  <li>• Provide customer support</li>
                  <li>• Send order confirmations and receipts</li>
                  <li>• Handle returns and refunds</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Account Management</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• Create and maintain your account</li>
                  <li>• Authenticate your identity</li>
                  <li>• Save your preferences and history</li>
                  <li>• Provide personalized recommendations</li>
                  <li>• Send account-related notifications</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Communication</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• Send promotional offers (with consent)</li>
                  <li>• Share seasonal collections and tips</li>
                  <li>• Provide occasion reminders</li>
                  <li>• Conduct surveys and gather feedback</li>
                  <li>• Send important service updates</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Business Operations</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• Analyze website usage and performance</li>
                  <li>• Prevent fraud and ensure security</li>
                  <li>• Comply with legal requirements</li>
                  <li>• Improve our products and services</li>
                  <li>• Conduct business analytics</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">How We Share Your Information</h2>
            
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">✓ We Share Information With:</h3>
                <ul className="text-green-700 space-y-2">
                  <li>• <strong>Delivery Partners:</strong> Name and address for successful delivery</li>
                  <li>• <strong>Payment Processors:</strong> Billing information for transaction processing</li>
                  <li>• <strong>Service Providers:</strong> Trusted partners who help operate our business</li>
                  <li>• <strong>Legal Authorities:</strong> When required by law or to protect rights</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-3">✗ We Never:</h3>
                <ul className="text-red-700 space-y-2">
                  <li>• Sell your personal information to third parties</li>
                  <li>• Share your data for others' marketing without consent</li>
                  <li>• Provide access to your account information to unauthorized parties</li>
                  <li>• Use your information for purposes not disclosed in this policy</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Data Security & Protection</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Technical Safeguards</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• SSL encryption for all data transmission</li>
                  <li>• Secure servers with regular security updates</li>
                  <li>• Multi-factor authentication options</li>
                  <li>• Regular security audits and monitoring</li>
                  <li>• Encrypted storage of sensitive information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Operational Safeguards</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• Limited access to personal data</li>
                  <li>• Employee training on data protection</li>
                  <li>• Regular backup and recovery procedures</li>
                  <li>• Incident response and breach notification</li>
                  <li>• Vendor security requirements and audits</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Important Security Note</h3>
              <p className="text-yellow-700">
                While we implement strong security measures, no system is 100% secure. Please use strong passwords, 
                keep your account information confidential, and report any suspicious activity immediately.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Privacy Rights</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Access & Portability</h3>
                <p className="text-gray-600">
                  Request a copy of your personal information and download your data in a portable format.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Correction & Updates</h3>
                <p className="text-gray-600">
                  Update or correct your personal information through your account settings or by contacting us.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Marketing Preferences</h3>
                <p className="text-gray-600">
                  Opt out of marketing communications at any time through unsubscribe links or account settings.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Account Deletion</h3>
                <p className="text-gray-600">
                  Request deletion of your account and associated data (some information may be retained for legal compliance).
                </p>
              </div>
            </div>
          </section>

          {/* Cookies & Tracking */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Cookies & Tracking Technologies</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left">Cookie Type</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Purpose</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">Essential</td>
                    <td className="border border-gray-300 px-4 py-3">Website functionality, security, shopping cart</td>
                    <td className="border border-gray-300 px-4 py-3">Session/1 year</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">Analytics</td>
                    <td className="border border-gray-300 px-4 py-3">Usage statistics, performance monitoring</td>
                    <td className="border border-gray-300 px-4 py-3">2 years</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">Marketing</td>
                    <td className="border border-gray-300 px-4 py-3">Personalized ads, campaign tracking</td>
                    <td className="border border-gray-300 px-4 py-3">1 year</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">Preferences</td>
                    <td className="border border-gray-300 px-4 py-3">Language, region, display settings</td>
                    <td className="border border-gray-300 px-4 py-3">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-gray-600 mt-4">
              You can manage cookie preferences through your browser settings or our cookie consent banner. 
              Note that disabling certain cookies may affect website functionality.
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Data Retention</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-800">Account Information</span>
                <span className="text-gray-600">Until account deletion + 30 days</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-800">Order History</span>
                <span className="text-gray-600">7 years (tax/legal requirements)</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-800">Marketing Data</span>
                <span className="text-gray-600">Until opt-out + 30 days</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-800">Website Analytics</span>
                <span className="text-gray-600">26 months (anonymized)</span>
              </div>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Children's Privacy</h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <p className="text-orange-800">
                Our services are not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If you believe we have collected information from 
                a child under 13, please contact us immediately so we can delete it.
              </p>
            </div>
          </section>

          {/* International Users */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">International Users</h2>
            <p className="text-gray-600 mb-4">
              If you are accessing our services from outside the United States, please note that your information 
              may be transferred to, stored, and processed in the United States where our servers are located.
            </p>
            <p className="text-gray-600">
              By using our services, you consent to the transfer of your information to the United States and 
              acknowledge that U.S. privacy laws may differ from those in your country.
            </p>
          </section>

          {/* Contact & Updates */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Contact Us About Privacy</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                If you have questions about this privacy policy or want to exercise your privacy rights, contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> <a href="mailto:privacy@apnaflar.com" className="text-rose-600 hover:text-rose-700">privacy@apnaflar.com</a></p>
                <p><strong>Phone:</strong> <a href="tel:+15551234567" className="text-rose-600 hover:text-rose-700">+1 (555) 123-4567</a></p>
                <p><strong>Mail:</strong> Apna Flar Privacy Team, 123 Flower Street, Garden City, GC 12345</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Policy Updates</h3>
              <p className="text-blue-700 text-sm">
                We may update this privacy policy periodically. We'll notify you of significant changes via email 
                or website notice. Your continued use of our services after changes indicates acceptance of the updated policy.
              </p>
            </div>
          </section>

          <div className="text-sm text-gray-500 border-t pt-6">
            <p>Last updated: November 2024</p>
            <p>This privacy policy is effective as of the date listed above and replaces any prior versions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;