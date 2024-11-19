/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    async rewrites() {
      return [
        {
          source: "/SHIPPING_RFC/:route",
          destination: `http://localhost:5000/SHIPPING_RFC/:route`,
        },
        {
           source: "/SHIPPING_DB/:route",
           destination: `http://localhost:5000/SHIPPING_DB/:route`,
        },
        {
          source: "/SHIPPING_AD/:route",
          destination: `http://localhost:5000/SHIPPING_AD/:route`,
       },
      ];
    }

};

export default nextConfig;
