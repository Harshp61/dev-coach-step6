import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        surface: '#0f1117',
        panel: '#161b27',
        border: '#1e2535',
        accent: '#4f8ef7',
        warn: '#f5a623',
        critical: '#e85d5d',
        success: '#4caf82',
        muted: '#5a6480',
      }
    },
  },
  plugins: [],
}
export default config
