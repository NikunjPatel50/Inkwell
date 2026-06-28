import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Accept GROQ_API_KEY on Vercel/hosting when users omit the VITE_ prefix.
  const groqApiKey = env.VITE_GROQ_API_KEY || env.GROQ_API_KEY || "";

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_GROQ_API_KEY": JSON.stringify(groqApiKey),
    },
  };
});
