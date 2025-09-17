## Dockerfile único (front + back) usando Node
## - Stage build: instala deps, compila backend y build de Vite
## - Stage runtime: ejecuta Express sirviendo API y frontend en el puerto 3000

FROM node:20-slim AS build

WORKDIR /app

RUN ls -la

# Copia manifests y usa caché
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* backend/package* ./
RUN npm ci || npm install

# Copiar el resto del repo
COPY . .

# Construir backend y frontend (usa los scripts del monorepo)
RUN npm run build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production

# Copiar node_modules de raíz y de backend
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/node_modules ./backend/node_modules

# Copiar dist del front y del back
COPY --from=build /app/dist ./dist
COPY --from=build /app/backend/dist ./backend/dist

# Copiar package.json para posibles introspecciones
COPY package.json ./package.json
COPY backend/package.json ./backend/package.json

# Variables default (puedes override con Dokploy)
ENV PORT=3000

EXPOSE 3000

# Comando: arrancar backend compilado que también sirve el front
CMD ["node", "backend/dist/index.js"]
