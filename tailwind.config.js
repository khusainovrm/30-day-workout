/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: { extend: {
    colors: { ink: 'rgb(var(--ink) / <alpha-value>)', muted: 'rgb(var(--muted) / <alpha-value>)', accent: 'rgb(var(--accent) / <alpha-value>)', page: 'rgb(var(--page) / <alpha-value>)', surface: 'rgb(var(--surface) / <alpha-value>)', card: 'rgb(var(--card) / <alpha-value>)', line: 'rgb(var(--line) / <alpha-value>)' },
    maxWidth: { app: '540px' },
    boxShadow: { app: '0 0 50px rgba(0,0,0,.08)' }
  } },
  plugins: []
}
