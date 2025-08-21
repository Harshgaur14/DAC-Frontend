import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "http://10.226.37.205:3001", 
    "http://10.226.49.255:3000", 
    "http://localhost:3001","http://localhost:3000",
    // Add any other origins needed for dev
  ]
};

export default nextConfig;
