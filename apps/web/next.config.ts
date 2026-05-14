import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "4000" },
      { protocol: "https", hostname: "*.onrender.com" },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: require.resolve("react"),
      "react-dom": require.resolve("react-dom"),
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
