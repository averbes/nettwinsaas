# NetTwinSaaS - Backend

Backend para la aplicación NetTwinSaaS, construido con Node.js, Express, TypeScript y MongoDB.

## Características

- Autenticación con JWT
- Gestión de usuarios
- Simulaciones de red
- Descubrimiento de topología de red
- Documentación de API con Swagger (próximamente)

## Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- MongoDB (local o Atlas)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd backend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` basado en `.env.example` y configura las variables de entorno:
   ```bash
   cp .env.example .env
   ```

4. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/         # Configuraciones
│   ├── controllers/    # Controladores
│   ├── middleware/     # Middlewares
│   ├── models/         # Modelos de MongoDB
│   ├── routes/         # Rutas de la API
│   ├── services/       # Lógica de negocio
│   ├── utils/          # Utilidades
│   ├── app.ts          # Aplicación Express
│   └── server.ts       # Punto de entrada del servidor
├── logs/              # Archivos de log
├── .env.example       # Variables de entorno de ejemplo
└── package.json       # Dependencias y scripts
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/nettwinsaas

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d

# CORS
FRONTEND_URL=http://localhost:5173
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo con hot-reload
- `npm run build`: Compila el código TypeScript a JavaScript
- `npm start`: Inicia el servidor en producción
- `npm run format`: Formatea el código usando Prettier

## Documentación de la API

La documentación de la API estará disponible en `/api-docs` una vez que se implemente Swagger.

## Despliegue

Para desplegar en producción:

1. Construye la aplicación:
   ```bash
   npm run build
   ```

2. Inicia el servidor en producción:
   ```bash
   npm start
   ```

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia ISC.
