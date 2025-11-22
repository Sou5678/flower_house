// pages/FAQPage.jsx
import React, { useState } from 'react';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';
import Container from '../components/Container';
import Section from '../components/Section';

const FAQPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqData = [
    {
      id: 1,
      category: 'Orders & Delivery',
      questions: [
        {
          id: 'order-1',
          question: 'How do I place an order?',
          answer: 'You can place an order by browsing our collections, selecting your desired arrangement, customizing it if needed, and proceeding to checkout. We accept all major credit cards and PayPal.'
        },
        {
          id: 'order-2',
          question: 'What are your delivery options?',
          answer: 'We offer same-day delivery (orders before 2 PM), next-day delivery, and scheduled delivery up to 30 days in advance. Delivery is available within our service areas from 9 AM to 6 PM.'
        },
        {
          id: 'order-3',
          question: 'Can I change or cancel my order?',
          answer: 'Orders can be modified or cancelled up to 2 hours before the scheduled delivery time. Please contact our customer service team as soon as possible for any changes.'
        },
        {
          id: 'order-4',
          question: 'Do you deliver on weekends and holidays?',
          answer: 'Yes, we deliver 7 days a week including most holidays. Holiday delivery may have special timing and pricing. Check our holiday schedule for specific dates.'
        }
      ]
    },
    {
      id: 2,
      category: 'Products & Quality',
      questions: [
        {
          id: 'product-1',
          question: 'How fresh are your flowers?',
          answer: 'All our flowers are sourced fresh daily from local growers and international suppliers. We guarantee freshness and quality, with most arrangements lasting 7-10 days with proper care.'
        },
        {
          id: 'product-2',
          question: 'Can I customize my arrangement?',
          answer: 'Absolutely! You can choose different sizes, add vases, include personal notes, and even request specific flower substitutions. Our florists will accommodate your preferences whenever possible.'
        },
        {
          id: 'product-3',
          question: 'What if I\'m not satisfied with my order?',
          answer: 'We stand behind our quality 100%. If you\'re not completely satisfied, contact us within 24 hours of delivery and we\'ll make it right with a replacement or full refund.'
        },
        {
          id: 'product-4',
          question: 'Do you offer seasonal flowers?',
          answer: 'Yes! We feature seasonal collections throughout the year, showcasing the best flowers for each season. This ensures optimal freshness and supports sustainable growing practices.'
        }
      ]
    },
    {
      id: 3,
      category: 'Care & Maintenance',
      questions: [
        {
          id: 'care-1',
          question: 'How do I make my flowers last longer?',
          answer: 'Keep flowers in cool water, trim stems at an angle every 2-3 days, remove wilted blooms, and place away from direct sunlight and heat sources. Use the provided flower food for best results.'
        },
        {
          id: 'care-2',
          question: 'What should I do when I receive my flowers?',
          answer: 'Immediately place them in fresh, cool water. Trim about 1 inch from the bottom of each stem at an angle under running water. Add the provided flower food and arrange as desired.'
        },
        {
          id: 'care-3',
          question: 'Can I replant the flowers?',
          answer: 'Cut flowers cannot be replanted, but some of our arrangements include potted plants that can be transplanted to your garden. Check the product description for details.'
        }
      ]
    },
    {
      id: 4,
      category: 'Account & Payments',
      questions: [
        {
          id: 'account-1',
          question: 'Do I need an account to place an order?',
          answer: 'While you can checkout as a guest, creating an account allows you to track orders, save favorites, store delivery addresses, and receive exclusive offers.'
        },
        {
          id: 'account-2',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay. All transactions are secure and encrypted.'
        },
        {
          id: 'account-3',
          question: 'Is my payment information secure?',
          answer: 'Yes, we use industry-standard SSL encryption and PCI-compliant payment processing. We never store your complete credit card information on our servers.'
        }
      ]
    }
  ];

  const toggleFAQ = (faqId) => {
    setOpenFAQ(openFAQ === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our flowers, delivery, and services"
        backgroundGradient="from-blue-50 to-indigo-50"
      />

      <Section padding="default">
        <div className="max-w-4xl mx-auto">
          {faqData.map((category) => (
            <div key={category.id} className="mb-8 md:mb-12">
              {/* Category Header */}
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-light text-gray-800 mb-2">
                  {category.category}
                </h2>
                <div className="w-16 h-1 bg-rose-500"></div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {category.questions.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                  >
                    {/* Question */}
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition duration-300"
                    >
                      <h3 className="text-base md:text-lg font-medium text-gray-800 pr-4">
                        {faq.question}
                      </h3>
                      <svg
                        className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 flex-shrink-0 ${
                          openFAQ === faq.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Answer */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openFAQ === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 pb-4">
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Contact Section */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 md:p-8 text-center mt-12">
            <h3 className="text-xl md:text-2xl font-light text-gray-800 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              Our customer service team is here to help you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@amourflorals.com"
                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-full font-medium transition duration-300 text-sm md:text-base"
              >
                Email Support
              </a>
              <a
                href="tel:+1-555-FLOWERS"
                className="bg-white border border-rose-600 text-rose-600 hover:bg-rose-50 px-6 py-3 rounded-full font-medium transition duration-300 text-sm md:text-base"
              >
                Call Us: (555) FLOWERS
              </a>
            </div>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default FAQPage;