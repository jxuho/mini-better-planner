import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      boxShadow: {
        panel: '0 12px 36px rgba(15, 23, 42, 0.12)',
      },
      colors: {
        ink: '#18212f',
        mist: '#edf2f7',
        depot: '#0f766e',
        warning: '#b45309',
        danger: '#b91c1c',
      },
    },
  },
  plugins: [],
} satisfies Config;
