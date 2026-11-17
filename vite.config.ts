import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    // The React Router build output lives inside the project root. Watching it
    // causes EBUSY crashes on Windows while files are being written.
    watch: {
      ignored: ["**/build/**"],
    },
  },
});
