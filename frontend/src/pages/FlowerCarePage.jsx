// pages/FlowerCarePage.jsx
import React from 'react';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';
import Container from '../components/Container';
import Section from '../components/Section';

const FlowerCarePage = () => {
  const careSteps = [
    {
      id: 1,
      title: 'Immediate Care',
      icon: '💧',
      steps: [
        'Remove flowers from packaging immediately upon arrival',
        'Fill a clean vase with fresh, cool water',
        'Add the provided flower food to the water',
        'Trim stems at a 45-degree angle under running water',
        'Remove any leaves that would be below the waterline'
      ]
    },
    {
      id: 2,
      title: 'Daily Maintenance',
      icon: '🌸',
      steps: [
        'Check water level daily and top up as needed',
        'Remove any wilted or dead flowers and leaves',
        'Gently mist petals with water (avoid fuzzy flowers)',
        'Rotate the vase to ensure even light exposure',
        'Keep away from direct sunlight and heat sources'
      ]
    },
    {
      id: 3,
      title: 'Every 2-3 Days',
      icon: '✂️',
      steps: [
        'Change the water completely with fresh, cool water',
        'Clean the vase thoroughly to remove bacteria',
        'Trim stems by 1 inch at a 45-degree angle',
        'Add fresh flower food to the new water',
        'Rearrange flowers as needed for best appearance'
      ]
    }
  ];

  const flowerTypes = [
    {
      name: 'Roses',
      care: 'Remove outer guard petals, keep in cool water, trim stems regularly',
      lifespan: '7-10 days',
      tips: 'Roses prefer cooler temperatures. Remove thorns carefully to avoid damage.'
    },
    {
      name: 'Lilies',
      care: 'Remove pollen-heavy stamens, keep in deep water, trim stems underwater',
      lifespan: '7-14 days',
      tips: 'Remove stamens to prevent pollen stains and extend flower life.'
    },
    {
      name: 'Tulips',
      care: 'Keep in shallow, cool water, trim stems straight across',
      lifespan: '5-7 days',
      tips: 'Tulips continue growing in water. Trim regularly to maintain arrangement.'
    },
    {
      name: 'Orchids',
      care: 'Mist regularly, avoid overwatering, provide indirect light',
      lifespan: '2-3 weeks',
      tips: 'Orchids prefer humidity. Place on a humidity tray for best results.'
    },
    {
      name: 'Sunflowers',
      care: 'Use tall vase, change water frequently, trim thick stems',
      lifespan: '6-12 days',
      tips: 'Heavy heads need support. Use floral foam or wire for stability.'
    },
    {
      name: 'Peonies',
      care: 'Cut when buds are soft, keep cool, remove ants gently',
      lifespan: '5-8 days',
      tips: 'Peonies may have ants - they\'re harmless and help buds open.'
    }
  ];

  const troubleshooting = [
    {
      problem: 'Flowers drooping quickly',
      solutions: [
        'Check if stems are properly cut at an angle',
        'Ensure vase is clean and water is fresh',
        'Move away from heat sources and direct sunlight',
        'Try cutting stems shorter and using less water'
      ]
    },
    {
      problem: 'Water becoming cloudy',
      solutions: [
        'Change water immediately',
        'Clean vase thoroughly with bleach solution',
        'Trim stems and remove any rotting material',
        'Use flower food to prevent bacterial growth'
      ]
    },
    {
      problem: 'Petals falling off',
      solutions: [
        'This is natural aging - remove fallen petals',
        'Reduce room temperature if possible',
        'Ensure adequate water supply',
        'Gently mist flowers (except fuzzy varieties)'
      ]
    },
    {
      problem: 'Buds not opening',
      solutions: [
        'Place in warm (not hot) location temporarily',
        'Ensure stems are properly hydrated',
        'Gently massage closed buds',
        'Be patient - some flowers take time to open'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      <PageHeader
        title="Flower Care Guide"
        subtitle="Learn how to keep your beautiful arrangements fresh and vibrant for as long as possible"
        backgroundGradient="from-green-50 to-emerald-50"
      />

      {/* Care Steps */}
      <Section padding="default">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-800 mb-4">
            Essential Care Steps
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Follow these simple steps to maximize the life and beauty of your floral arrangements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {careSteps.map((step) => (
            <div key={step.id} className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <div className="text-center mb-6">
                <div className="text-4xl md:text-5xl mb-4">{step.icon}</div>
                <h3 className="text-xl md:text-2xl font-light text-gray-800">
                  {step.title}
                </h3>
              </div>
              <ul className="space-y-3">
                {step.steps.map((stepText, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-rose-100 text-rose-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-600 text-sm md:text-base">{stepText}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Flower-Specific Care */}
      <Section padding="default" background="bg-gray-50">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-800 mb-4">
            Flower-Specific Care
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Different flowers have unique needs. Here's how to care for popular varieties
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flowerTypes.map((flower, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg md:text-xl font-medium text-gray-800 mb-3">
                {flower.name}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Care:</span>
                  <p className="text-sm text-gray-600 mt-1">{flower.care}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Lifespan:</span>
                  <p className="text-sm text-rose-600 mt-1">{flower.lifespan}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Pro Tip:</span>
                  <p className="text-sm text-gray-600 mt-1">{flower.tips}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Troubleshooting */}
      <Section padding="default">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-800 mb-4">
            Troubleshooting Common Issues
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Quick solutions for common flower care problems
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {troubleshooting.map((issue, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <h3 className="text-lg md:text-xl font-medium text-gray-800 mb-4 flex items-center">
                <span className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                  !
                </span>
                {issue.problem}
              </h3>
              <div className="ml-11">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Solutions:</h4>
                <ul className="space-y-2">
                  {issue.solutions.map((solution, sIndex) => (
                    <li key={sIndex} className="flex items-start">
                      <span className="bg-green-100 text-green-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                        ✓
                      </span>
                      <span className="text-gray-600 text-sm md:text-base">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Tips Section */}
      <Section padding="default" background="bg-rose-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-800 mb-6">
            Pro Tips for Longer-Lasting Flowers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">
                  1
                </span>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Use Sharp, Clean Tools</h4>
                  <p className="text-gray-600 text-sm">Clean cuts prevent bacteria and allow better water uptake</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">
                  2
                </span>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Temperature Matters</h4>
                  <p className="text-gray-600 text-sm">Cool environments extend flower life significantly</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">
                  3
                </span>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Flower Food Works</h4>
                  <p className="text-gray-600 text-sm">Always use the provided flower food - it contains nutrients and antibacterial agents</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">
                  4
                </span>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Clean Water Only</h4>
                  <p className="text-gray-600 text-sm">Change water every 2-3 days and clean the vase thoroughly</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">
                  5
                </span>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Strategic Placement</h4>
                  <p className="text-gray-600 text-sm">Away from heat sources, direct sunlight, and drafts</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">
                  6
                </span>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Regular Maintenance</h4>
                  <p className="text-gray-600 text-sm">Daily checks and gentle care make a huge difference</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default FlowerCarePage;