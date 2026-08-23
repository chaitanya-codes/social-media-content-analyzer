/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "tesseract.js", "tesseract.js-core"],
    outputFileTracingIncludes: {
      "/*": [
        "./node_modules/tesseract.js/**/*",
        "./node_modules/tesseract.js-core/**/*",
        "./node_modules/.pnpm/tesseract.js-core@*/node_modules/tesseract.js-core/**/*"
      ]
    }
  }
};
export default nextConfig;
