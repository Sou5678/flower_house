/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Custom Color Palette - Elegant Floral Theme
      colors: {
        // Primary Brand Colors
        primary: {
          50: '#fdf2f8',   // Lightest pink
          100: '#fce7f3',  // Very light pink
          200: '#fbcfe8',  // Light pink
          300: '#f9a8d4',  // Medium light pink
          400: '#f472b6',  // Medium pink
          500: '#ec4899',  // Main brand pink
          600: '#db2777',  // Darker pink
          700: '#be185d',  // Dark pink
          800: '#9d174d',  // Very dark pink
          900: '#831843',  // Darkest pink
        },
        
        // Secondary Colors - Elegant Rose
        secondary: {
          50: '#fff1f2',   // Lightest rose
          100: '#ffe4e6',  // Very light rose
          200: '#fecdd3',  // Light rose
          300: '#fda4af',  // Medium light rose
          400: '#fb7185',  // Medium rose
          500: '#f43f5e',  // Main rose
          600: '#e11d48',  // Darker rose
          700: '#be123c',  // Dark rose
          800: '#9f1239',  // Very dark rose
          900: '#881337',  // Darkest rose
        },
        
        // Accent Colors - Soft Lavender
        accent: {
          50: '#faf5ff',   // Lightest lavender
          100: '#f3e8ff',  // Very light lavender
          200: '#e9d5ff',  // Light lavender
          300: '#d8b4fe',  // Medium light lavender
          400: '#c084fc',  // Medium lavender
          500: '#a855f7',  // Main lavender
          600: '#9333ea',  // Darker lavender
          700: '#7c3aed',  // Dark lavender
          800: '#6b21a8',  // Very dark lavender
          900: '#581c87',  // Darkest lavender
        },
        
        // Neutral Colors - Warm Grays
        neutral: {
          50: '#fafaf9',   // Almost white
          100: '#f5f5f4',  // Very light gray
          200: '#e7e5e4',  // Light gray
          300: '#d6d3d1',  // Medium light gray
          400: '#a8a29e',  // Medium gray
          500: '#78716c',  // Main gray
          600: '#57534e',  // Darker gray
          700: '#44403c',  // Dark gray
          800: '#292524',  // Very dark gray
          900: '#1c1917',  // Darkest gray
        },
        
        // Success, Warning, Error Colors
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      
      // Custom Font Families
      fontFamily: {
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'heading': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'script': ['Dancing Script', 'cursive'],
        'elegant': ['Cormorant Garamond', 'serif'],
      },
      
      // Custom Font Sizes
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // Enhanced Animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'bounce-soft': 'bounceSoft 1s ease-in-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      
      // Custom Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Custom Border Radius
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      
      // Custom Box Shadows
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'elegant': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)',
        'dreamy': '0 8px 32px rgba(236, 72, 153, 0.12), 0 2px 16px rgba(236, 72, 153, 0.08)',
      },
      
      // Custom Gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'floral-gradient': 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fff1f2 100%)',
        'elegant-gradient': 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff  50%, #fdf2f8 100%)',
      },
    },
  },
  plugins: [],
}