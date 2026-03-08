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
                sans: ['Poppins', 'sans-serif'],
            },
            colors: {
                bg: '#0f0f0f',
                card: '#1a1a1a',
                accent: '#E50914',
                'text-primary': 'var(--clr-text-primary)',
                'text-secondary': 'var(--clr-text-secondary)',
                border: 'rgba(255,255,255,0.08)',
            },
            boxShadow: {
                'red-glow': '0 0 20px rgba(229,9,20,0.6), 0 0 40px rgba(229,9,20,0.3)',
                'red-sm': '0 0 10px rgba(229,9,20,0.4)',
            },
            backgroundImage: {
                'hero-gradient': 'linear-gradient(to right, rgba(15,15,15,0.95) 30%, rgba(15,15,15,0.6) 60%, rgba(15,15,15,0.1) 100%)',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-in-out both',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            screens: {
                xs: '480px',
            },
        },
    },
    plugins: [],
}
