/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"] ,
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        accent: "#22c55e",
        ramadan: "#fbbf24"
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        sans: ["Noto Sans", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 30px rgba(34, 197, 94, 0.2)"
      }
    }
  },
  plugins: []
};
