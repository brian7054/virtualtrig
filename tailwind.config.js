/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}" // harmless if no app/ folder
  ],
theme: {
  extend: {
    colors: {
      brand: {
        ink: '#0B1220',
        indigo: '#4F46E5',
        cyan: '#06B6D4',
        amber: '#F59E0B',
      }
    }
  }
}

  plugins: [],
};
