/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // edison9733 — AI automation studio palette
        ink: '#0E0F11',          // near-black text
        paper: '#FAFAF7',        // warm off-white page
        background: '#FAFAF7',   // alias (legacy refs)
        surface: '#FFFFFF',      // cards
        muted: '#6B6F76',        // secondary text
        line: '#E7E5DF',         // borders / dividers
        divider: '#E7E5DF',      // alias
        dark: '#0E0F11',         // dark sections
        'dark-soft': '#16181C',  // dark section cards
        deep: '#0E0F11',         // alias
        accent: '#B6F03C',       // lime signal
        'accent-dark': '#9BD92A',
        'accent-ink': '#16210A', // text on accent
        primary: '#B6F03C',      // alias
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
        '7xl': '4rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 32s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
