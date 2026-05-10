/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#60a5fa',
        secondary: '#34d399',
        accent: '#f59e0b',
        dark: {
          bg: '#1a1a2e',
          card: '#0f172a',
        },
        light: {
          bg: '#f8fafc',
          card: '#ffffff',
        }
      }
    }
  },
  plugins: []
};
