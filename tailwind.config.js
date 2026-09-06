/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "375px",
        sm: "480px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
      colors: {
        navy: {
          DEFAULT: "#1F2933",
          deep: "#184A4E",
          mid: "#2A7074",
        },
        brand: {
          DEFAULT: "#1F5F63",
          soft: "#3C8D8B",
          light: "#DDEEEE",
          muted: "#E8F4F4",
        },
        teal: {
          DEFAULT: "#3C8D8B",
          soft: "#5BA3A1",
          light: "#DDEEEE",
          deep: "#1F5F63",
        },
        cream: {
          DEFAULT: "#F6F4EF",
          dark: "#EDE9E0",
          muted: "#F9F7F3",
        },
        ink: {
          DEFAULT: "#1F2933",
          muted: "#667085",
        },
        gold: "#C99B5A",
        line: "#E6E8EC",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(31, 95, 99, 0.06)",
        lift: "0 16px 36px rgba(31, 95, 99, 0.12)",
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};
