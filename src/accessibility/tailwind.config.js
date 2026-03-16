/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // WCAG compliant colors
        primary: {
          light: '#2563eb', // AA compliant for white text
          DEFAULT: '#1d4ed8',
          dark: '#1e40af' // AAA compliant for white text
        },
        secondary: {
          light: '#7c3aed',
          DEFAULT: '#6d28d9',
          dark: '#5b21b6'
        },
        // High contrast accessibility palette
        accessible: {
          text: {
            high: '#000000',
            medium: '#1f2937',
            low: '#6b7280'
          },
          background: {
            light: '#ffffff',
            dark: '#111827'
          }
        }
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }]
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      }
    }
  },
  plugins: [],
  // WCAG compliance rules
  safelist: [
    'text-accessible-text-high',
    'bg-accessible-background-light',
    'text-accessible-text-medium',
    'bg-accessible-background-dark'
  ]
}
