import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "4000" },
      { protocol: "https", hostname: "*.onrender.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
