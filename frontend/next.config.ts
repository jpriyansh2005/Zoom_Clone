import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets React memoise components automatically, so the code does not need
  // hand-written useMemo/useCallback.
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
