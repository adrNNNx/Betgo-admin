# ---------- build ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Genera .next/standalone (server con solo las dependencias que usa).
ENV BUILD_STANDALONE=1
RUN npm run build

# ---------- runtime ----------
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
# Sin esto el server escucha en localhost y no responde fuera del contenedor.
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# El standalone ya trae su propio node_modules mínimo; `static` y `public` van
# aparte porque Next no los incluye en esa carpeta.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3001
CMD ["node", "server.js"]
