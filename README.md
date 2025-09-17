# Creador de Objetivos

Una aplicación web moderna para crear y gestionar objetivos personales, construida con React, TypeScript, Vite y Chakra UI.

## Características

### 🔐 Autenticación Básica

- Sistema de registro e inicio de sesión
- Gestión de usuarios con localStorage (simula base de datos MongoDB)
- Sesiones persistentes

### 🎯 Gestión de Objetivos

- **Crear objetivos** con información completa:
  - Título y descripción
  - Fecha límite
  - Prioridad (Baja, Media, Alta)
  - Propietario automático
- **Ver mis objetivos** - Lista personal de objetivos
- **Ver objetivos de otros usuarios** - Explorar objetivos públicos
- **Marcar como completado** - Interactividad con checkboxes
- **Eliminar objetivos** - Solo los propios objetivos

### 🎨 Interfaz de Usuario

- **Chakra UI v2** - Componentes modernos y accesibles
- **Diseño responsivo** - Funciona en desktop y móvil
- **Notificaciones** - Feedback visual para todas las acciones
- **Tabs navegables** - Separación clara entre "Mis Objetivos" y "Todos los Objetivos"
- **Modal forms** - Formularios elegantes para crear objetivos

### 🏗️ Arquitectura Técnica

- **Vite** - Build tool y dev server ultra-rápido
- **React 19** con TypeScript
- **Estructura modular**:
  - Components reutilizables
  - Context API para autenticación
  - Services para lógica de datos
  - Types centralizados

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── LoginForm.tsx   # Formulario de login/registro
│   ├── GoalForm.tsx    # Modal para crear objetivos
│   └── GoalList.tsx    # Lista de objetivos
├── contexts/           # React Context
│   └── AuthContext.tsx # Gestión de autenticación
├── pages/              # Páginas principales
│   └── Dashboard.tsx   # Panel principal
├── services/           # Lógica de negocio
│   └── api.ts         # Simulación de API con localStorage
├── types/              # Definiciones TypeScript
│   └── index.ts       # Interfaces y tipos
└── main.tsx           # Punto de entrada
```

## Instalación y Uso

### Requisitos

- Node.js 18+
- npm o yarn

### Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Previsualizar build
npm run preview

# Linting
npm run lint
```

### Despliegue en contenedor/Pod

Este repositorio ahora usa npm workspaces para gestionar el `backend/` como un paquete hijo. Para que las dependencias del backend se instalen durante el build:

- Asegúrate de usar Node.js 18+ y npm 9+ (workspaces nativos).
- Ejecuta `npm install` en la raíz del repo. Se ejecutará automáticamente un `postinstall` que hace `npm install --prefix backend` como respaldo si el gestor de paquetes no maneja workspaces.
- Para construir todo:

```bash
npm run build
```

En Docker/K8s, una receta mínima de Dockerfile multi-stage podría ser:

```Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/package.json backend/
RUN npm ci --ignore-scripts=false

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# (Opcional) Servir frontend estático con nginx y correr backend en otro pod/servicio
```

Si el backend y frontend van en el mismo contenedor de desarrollo, puedes usar:

```bash
npm run dev
```

Nota: Si tu Pod ejecuta solo el backend, instala y construye dentro de `backend/` con `npm ci && npm run build && npm start`.

## Demo de Uso

### 1. Registro/Login

- Registra un nuevo usuario o usa cualquier usuario existente con contraseña "password"
- La autenticación es básica pero funcional

### 2. Crear Objetivos

- Haz clic en "Nuevo Objetivo"
- Completa el formulario con título, descripción, fecha y prioridad
- El objetivo se guarda automáticamente

### 3. Gestionar Objetivos

- **Mis Objetivos**: Ve y edita tus objetivos personales
- **Todos los Objetivos**: Explora objetivos de otros usuarios
- Marca objetivos como completados con checkboxes
- Elimina tus propios objetivos

## Tecnologías Utilizadas

- **Frontend**: React 19 + TypeScript
- **UI Library**: Chakra UI v2
- **Build Tool**: Vite
- **Routing**: React Router v7
- **State Management**: React Context API
- **Data Storage**: localStorage (simula MongoDB)
- **Icons**: Chakra UI Icons
- **Styling**: Emotion + Chakra UI

## Características Implementadas Según Requisitos

✅ **Autenticación básica** - Sistema completo de login/registro
✅ **Base de datos simulada** - localStorage simula MongoDB en la nube
✅ **Chakra UI** - Interfaz completa con componentes existentes
✅ **Vite framework** - Configuración y build con Vite
✅ **Creador de objetivos** - Formulario completo con todos los campos
✅ **Marcar propietario** - Automático al crear objetivos
✅ **Fecha y descripción** - Campos obligatorios en el formulario
✅ **Marcado por usuario** - Separación clara de objetivos por usuario
✅ **Ver objetivos de otros** - Tab dedicado para explorar objetivos públicos
✅ **Solo componentes Chakra UI** - No se crearon componentes personalizados

## Próximas Mejoras

- Integración con MongoDB real
- Autenticación JWT
- Filtros y búsqueda avanzada
- Categorías de objetivos
- Recordatorios y notificaciones
- Compartir objetivos específicos
