import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `standalone` genera un server mínimo en .next/standalone para la imagen de
  // Docker. Se activa solo durante el build de la imagen: `next start` no
  // funciona con este output y en local lo seguimos usando.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
};

export default nextConfig;
