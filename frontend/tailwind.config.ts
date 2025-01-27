// import type { Config } from "tailwindcss";

// export default {
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
  
//   theme: {
//     extend: {
//       backgroundImage: {
//         "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
//         "gradient-conic":
//           "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
//       },
//       colors: {
//         amber: {
//           700: "#ff4f00",
//         },
//         slate: {
//           100: "#ebe9df",
//         },
//       },
//     },
//   },
//   plugins: [],
// } satisfies Config;



import type { Config } from "tailwindcss";

export default {
  darkMode: "class", // Enables dark mode using the "class" strategy
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        dark: {
          DEFAULT: "#121212", // Dark mode background color
          lighter: "#1a1a1a",
          darker: "#0d0d0d",
        },
        amber: {
          700: "#ff4f00",
        },
        slate: {
          100: "#ebe9df",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

