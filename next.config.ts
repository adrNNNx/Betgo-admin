import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `standalone` genera un server mínimo en .next/standalone para la imagen de
  // Docker. Se activa solo durante el build de la imagen: `next start` no
  // funciona con este output y en local lo seguimos usando.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,

  experimental: {
    // El default de 1 MB cortaba el alta de premios/símbolos/banners con
    // imagen, y el error que tira Next es un digest ilegible para el usuario.
    // 5 MB deja aire para la imagen más los campos del form.
    //
    // El límite real de imagen lo pone el backend en 3 MB (ImageFilePipe y los
    // `limits` de multer). Eso es a propósito: pasado ese punto queremos el
    // mensaje claro del backend, no el corte opaco de Next.
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
