/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Satoshi', 'sans-serif'],
            },
            colors: {
                // UI/UX Overhaul - Light Mode Surfaces
                app: {
                    bg: '#FAF9F6',          // Layer 0: Off-White (Global Background)
                    card: '#FFFAFA',        // Layer 1: Snow (Cards/Content)
                    ui: '#F8F8FF',          // Layer 2: Ghost White (Sidebar/Filters)
                    interaction: '#F0F8FF', // Alice Blue (Hover/Active/Secondary)
                    info: '#FFFFF0',        // Ivory (Tooltips/Highlights)
                },
                // UI/UX Overhaul - Pastel Tints (Data/Tags)
                pastel: {
                    peach: '#FFF0E6',     // Muted Peach
                    mint: '#E0F2F1',      // Muted Mint
                    lavender: '#F3E5F5',  // Muted Lavender
                    blue: '#E3F2FD',      // Muted Blue
                },
                // UI/UX Overhaul - Typography
                text: {
                    primary: '#1A1D23',   // Dark Gray/Blue
                    secondary: '#64748B', // Lighter Gray
                },
                // UI/UX Overhaul - Semantic Tokens (Pastel Backgrounds)
                semantic: {
                    success: { bg: '#E8F5E9', text: '#2E7D32' },
                    warning: { bg: '#FFF9C4', text: '#FF8F00' },
                    error: { bg: '#FFEBEE', text: '#C62828' },
                    info: { bg: '#F0F8FF', text: '#1565C0' },
                }
            }
        },
    },
    plugins: [],
}
