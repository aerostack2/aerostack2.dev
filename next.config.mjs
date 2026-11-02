import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Images are served as they are. The avatars already come from GitHub at the
  // size they're shown, and this keeps clear of Vercel's image quotas.
  images: {
    unoptimized: true,
  },
};

export default withMDX(config);
