// pages/AboutPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';
import Container from '../components/Container';
import Section from '../components/Section';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <PageHeader
        title="Where Every Petal Tells a Story"
        subtitle="The unique story and peaceful petals from Tamir, Padma, our residential forest with our customers."
        backgroundGradient="from-green-50 to-emerald-100"
      />

      {/* Passion Section */}
      <Section padding="default" containerSize="sm">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-800 mb-6">
            The Spark of Passion
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            A short, romantic paragraph about the initial spark or passion for flinting that led to the creation of Anwar Florids. It all started with a single social of no idea to share emotion and create beauty through the timeless art of Flinting.
          </p>
        </div>
      </Section>

      {/* Founder's Note Section */}
      <Section padding="default" background="bg-gray-50" containerSize="sm">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 lg:p-12">
          <div className="text-center">
            <span className="text-4xl md:text-5xl lg:text-6xl text-rose-400 mb-4 inline-block">"</span>
            <blockquote className="text-lg md:text-xl lg:text-2xl text-gray-700 italic leading-relaxed mb-6 md:mb-8">
              Please speak a universal language of love, exuberation, and advice. My journey has been back to every fruit belonging and sharing its poetry with the world.
            </blockquote>
            <div className="border-t border-gray-200 pt-6">
              <p className="text-base md:text-lg font-medium text-gray-800">Jam Sno</p>
              <p className="text-sm md:text-base text-gray-600">Founder & Lead Friend</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Journey Timeline Section */}
      <Section padding="default">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-center text-gray-800 mb-8 md:mb-12">
          Our Journey in Bloom
        </h2>
          
          <div className="space-y-12">
            {/* Timeline Item 1 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/3 text-center md:text-right md:pr-8 mb-6 md:mb-0">
                <div className="bg-rose-100 text-rose-800 px-6 py-3 rounded-full inline-block">
                  <span className="text-2xl font-light">2019</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mt-2">The First Seed</h3>
              </div>
              <div className="md:w-2/3 bg-gray-50 rounded-2xl p-6">
                <p className="text-gray-600 leading-relaxed">
                  Our journey found 3 small staff at the local farmers and 2 living car passion for unique, hard-fired foodquirts.
                </p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/3 text-center md:text-right md:pr-8 mb-6 md:mb-0 order-2 md:order-1">
                <div className="bg-rose-100 text-rose-800 px-6 py-3 rounded-full inline-block">
                  <span className="text-2xl font-light">2021</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mt-2">Our First Studio</h3>
              </div>
              <div className="md:w-2/3 bg-gray-50 rounded-2xl p-6 order-1 md:order-2">
                <p className="text-gray-600 leading-relaxed">
                  We opened our first 5 third studio space, a photo called Lukking could truly blossom and are excellent workshops.
                </p>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/3 text-center md:text-right md:pr-8 mb-6 md:mb-0">
                <div className="bg-rose-100 text-rose-800 px-6 py-3 rounded-full inline-block">
                  <span className="text-2xl font-light">2022</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mt-2">Blooming into Amour Florids</h3>
              </div>
              <div className="md:w-2/3 bg-gray-50 rounded-2xl p-6">
                <p className="text-gray-600 leading-relaxed">
                  Launched our own 8 years Amour Florids, in being one happy, loved designer to honour all on earth in city.
                </p>
              </div>
            </div>
          </div>
      </Section>

      {/* CTA Section */}
      <Section padding="lg" background="bg-rose-600" containerSize="sm">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-white mb-6">
            Ready to Create Your Own Story?
          </h2>
          <p className="text-rose-100 text-base md:text-lg mb-6 md:mb-8">
            It is our favorite part of their special moments. English professional playwrights who have never received assistance by their fans.
          </p>
          <Link 
            to="/collections" 
            className="bg-white text-rose-600 px-6 md:px-8 py-3 md:py-4 rounded-full font-medium text-base md:text-lg hover:bg-gray-100 transition duration-300 inline-block"
          >
            Bloom Our Celebration
          </Link>
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default AboutPage;