// const createNextIntlPlugin = require("next-intl/plugin");
import createNextIntlPlugin from "next-intl/plugin";
import ReactComponentName from "react-scan/react-component-name/webpack";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.plugins.push(ReactComponentName({}));
    return config;
  },
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
};

export default withNextIntl(nextConfig);
// module.exports = withNextIntl(nextConfig);
