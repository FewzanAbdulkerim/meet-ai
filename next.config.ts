import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects(){
    return [
      {
        source: '/',
        destination: '/meetings',
        permanent: true
      }
    ]
  }
};

export default nextConfig;
