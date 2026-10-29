/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e40af',
          hover: '#1d4ed8',
          light: '#eff6ff',
          dark: '#1e3a8a',
          border: '#bfdbfe'
        },
        accent: {
          DEFAULT: '#2563eb',
          soft: '#dbeafe'
        },
        success: {
          DEFAULT: '#10b981',
          dark: '#047857',
          light: '#ecfdf5',
          border: '#a7f3d0'
        },
        warning: {
          DEFAULT: '#f59e0b',
          dark: '#b45309',
          light: '#fffbeb',
          border: '#fde68a'
        },
        danger: {
          DEFAULT: '#ef4444',
          dark: '#b91c1c',
          light: '#fef2f2',
          border: '#fecaca'
        }
      }
    },
  },
  plugins: [],
};
