// pages/CookiePolicyPage.jsx
import React from 'react';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';

const CookiePolicyPage = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <PageHeader
        title="Cookie Policy"
        subtitle="How we use cookies to enhance your experience"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <div className="mb-8">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> November 21, 2024
            </p>
            <p className="text-gray-700 leading-relaxed">
              This Cookie Policy explains how Amour Florals uses cookies and similar technologies when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What Are Cookies?</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>
            <p className="text-gray-700">
              Cookies set by the website owner (in this case, Amour Florals) are called "first party cookies". Cookies set by parties other than the website owner are called "third party cookies".
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Why Do We Use Cookies?</h2>
            <p className="text-gray-700 mb-4">We use cookies for several reasons:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>To ensure our website functions properly</li>
              <li>To remember your preferences and settings</li>
              <li>To analyze how you use our website</li>
              <li>To personalize your experience</li>
              <li>To provide relevant advertisements</li>
              <li>To maintain your shopping cart contents</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Essential Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies are strictly necessary for the operation of our website. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">
                <strong>Examples:</strong> Session management, authentication, load balancing, shopping cart functionality
              </p>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Performance Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are most and least popular and see how visitors move around the site.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">
                <strong>Examples:</strong> Google Analytics, page load times, error tracking
              </p>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Functional Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">
                <strong>Examples:</strong> Language preferences, location settings, remembered login details
              </p>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Targeting Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">
                <strong>Examples:</strong> Facebook Pixel, Google Ads, retargeting pixels
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">
              In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the service, deliver advertisements on and through the service, and so on.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Third-Party Services We Use:</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
              <li><strong>Payment Processors:</strong> For secure payment processing</li>
              <li><strong>Social Media Platforms:</strong> For social sharing and login functionality</li>
              <li><strong>Customer Support:</strong> For live chat and support services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">How Can You Control Cookies?</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Browser Settings</h3>
            <p className="text-gray-700 mb-4">
              Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Cookie Consent</h3>
            <p className="text-gray-700 mb-4">
              When you first visit our website, you will see a cookie banner that allows you to accept or customize your cookie preferences. You can change these preferences at any time by clicking the "Cookie Settings" link in our footer.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Opt-Out Links</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" className="text-rose-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a></li>
              <li><strong>Facebook:</strong> <a href="https://www.facebook.com/settings?tab=ads" className="text-rose-600 hover:underline" target="_blank" rel="noopener noreferrer">Facebook Ad Preferences</a></li>
              <li><strong>General Opt-out:</strong> <a href="http://www.aboutads.info/choices/" className="text-rose-600 hover:underline" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cookie Retention</h2>
            <p className="text-gray-700 mb-4">
              The length of time a cookie remains on your computer or mobile device depends on whether it is a "persistent" or "session" cookie:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent cookies:</strong> Remain until they expire or you delete them</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Updates to This Policy</h2>
            <p className="text-gray-700">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about our use of cookies or other technologies, please contact us:
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

export default CookiePolicyPage;