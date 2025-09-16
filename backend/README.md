# Backend To-Do Web

## Instalación

1. Copia `.env.example` a `.env` y completa los valores.
2. Instala dependencias:
   ```sh
   cd backend
   npm install
   ```

## Scripts
- `npm run dev`: Desarrollo (hot reload)
- `npm run build`: Compilar TypeScript
- `npm start`: Ejecutar compilado

## Endpoints principales
- `POST /api/auth/register` — Registro de usuario
- `POST /api/auth/login` — Login, devuelve token
- `GET /api/auth/me` — Usuario autenticado (requiere token)
