import type { Config } from 'tailwindcss'

const c = (n: string) => `rgb(var(--c-${n}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { blush: c('blush'), petal: c('petal'), lavender: c('lav'), cream: c('cream'), peach: c('peach'), rose: c('rose'), ink: c('ink') },
      fontFamily: {
        script: ['"Dancing Script"', 'cursive'],
        body: ['"Quicksand"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        twinkle: { '0%,100%': { opacity: '0.3' }, '50%': { opacity: '1' } },
        flame: { '0%,100%': { transform: 'scale(1,1) rotate(-2deg)' }, '50%': { transform: 'scale(0.9,1.15) rotate(2deg)' } },
        rise: { from: { opacity: '0', transform: 'translateY(24px) scale(.97)' } },
      },
      animation: { floaty: 'floaty 4s ease-in-out infinite', twinkle: 'twinkle 2.5s ease-in-out infinite', flame: 'flame 0.6s ease-in-out infinite', rise: 'rise .7s cubic-bezier(.2,.8,.3,1) backwards' },
    },
  },
  plugins: [],
} satisfies Config
