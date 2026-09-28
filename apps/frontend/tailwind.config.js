/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: '#0f172a',
        'surface-elevated': '#1e293b',
        'surface-border': '#334155',
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          light: '#e0e7ff',
          dark: '#3730a3',
        },
        healthy: {
          DEFAULT: '#059669',
          light: '#d1fae5',
          dark: '#065f46',
        },
        warning: {
          DEFAULT: '#d97706',
          light: '#fef3c7',
          dark: '#92400e',
        },
        danger: {
          DEFAULT: '#e11d48',
          light: '#ffe4e6',
          dark: '#9f1239',
        },
        building: '#0284c7',
        water: '#0891b2',
        transport: '#d97706',
        electrical: '#7c3aed',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
