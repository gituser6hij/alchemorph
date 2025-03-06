/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{ts,tsx}',
      './components/**/*.{ts,tsx}',
      './app/**/*.{ts,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          'black-bean': 'var(--black-bean)',
          'indigo-dye': 'var(--indigo-dye)',
          'blue-munsell': 'var(--blue-munsell)',
          sunset: 'var(--sunset)',
          'light-orange': 'var(--light-orange)',
          saffron: 'var(--saffron)',
          jet: 'var(--jet)',
          'davys-gray': 'var(--davys-gray)',
          bittersweet: 'var(--bittersweet)',
          'lavender-blush': 'var(--lavender-blush)',
          background: 'var(--background)',
          foreground: 'var(--foreground)',
        },
      },
    },
    plugins: [
      require('tailwind-scrollbar'), // For scrollbar utilities
    ],
  };