import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050708',
        panel: '#0d1117',
        panelLight: '#111827',
        border: 'rgba(255,255,255,0.08)',
        glow: '#22d3ee',
        accent: '#38bdf8',
        accentSoft: '#0ea5e9',
      },
      boxShadow: {
        soft: '0 30px 90px rgba(0, 0, 0, 0.35)',
        glow: '0 0 40px rgba(56, 189, 248, 0.14)',
        subtle: '0 1px 3px rgba(0,0,0,0.4)',
        'elevated': '0 4px 24px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'panel-glass': 'linear-gradient(180deg, rgba(15,23,42,0.72), rgba(10,14,24,0.92))',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
