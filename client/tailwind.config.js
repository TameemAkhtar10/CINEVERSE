/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Space Grotesk"', 'sans-serif'],
            },
            colors: {
                bg: '#030712',
                card: '#0f172a',
                accent: '#6366f1',
                'accent-amber': '#f59e0b',
                'text-primary': 'var(--clr-text-primary)',
                'text-secondary': 'var(--clr-text-secondary)',
                border: 'rgba(255,255,255,0.08)',
            },
            boxShadow: {
                'indigo-glow': '0 0 24px rgba(99,102,241,0.7), 0 0 48px rgba(99,102,241,0.35)',
                'indigo-sm': '0 0 12px rgba(99,102,241,0.5)',
                'amber-glow': '0 0 16px rgba(245,158,11,0.7), 0 0 32px rgba(245,158,11,0.35)',
                // backwards-compat aliases so existing shadow-red-glow/red-sm → indigo
                'red-glow': '0 0 24px rgba(99,102,241,0.7), 0 0 48px rgba(99,102,241,0.35)',
                'red-sm': '0 0 12px rgba(99,102,241,0.5)',
            },
            backgroundImage: {
                'hero-gradient': 'linear-gradient(to right, rgba(3,7,18,0.97) 30%, rgba(3,7,18,0.7) 60%, rgba(3,7,18,0.1) 100%)',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-in-out both',
                'mesh-float': 'meshFloat 12s ease-in-out infinite alternate',
                'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                meshFloat: {
                    '0%': { transform: 'scale(1) translate(0%, 0%)' },
                    '33%': { transform: 'scale(1.08) translate(2%, -1.5%)' },
                    '66%': { transform: 'scale(0.96) translate(-2%, 2%)' },
                    '100%': { transform: 'scale(1.04) translate(1%, -2%)' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 10px rgba(245,158,11,0.45)' },
                    '50%': { boxShadow: '0 0 22px rgba(245,158,11,0.9), 0 0 44px rgba(245,158,11,0.4)' },
                },
            },
            screens: {
                xs: '480px',
            },
        },
    },
    plugins: [],
}
