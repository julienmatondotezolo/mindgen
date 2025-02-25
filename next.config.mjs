import createNextIntlPlugin from "next-intl/plugin";
import ReactComponentName from "react-scan/react-component-name/webpack";

const withNextIntl = createNextIntlPlugin();

/** @type {import("next").NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en",
        permanent: false,
      },
    ];
  },
  images: {
    domains: ["cdn.builder.io", "fakeimg.pl"],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Only needs to be enabled in production.
  // If you're using Turborepo, you should disable React Component Name in development.
  webpack: (config) => {
    config.plugins.push(ReactComponentName({}));
    return config;
  },
};

export default withNextIntl(nextConfig);
