#!/bin/bash
# NetTwinSaaS - Local Development Setup (Sin Docker)
set -e

echo "🚀 Configurando NetTwinSaaS para desarrollo local..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependencias básicas
echo -e "${YELLOW}📋 Verificando dependencias...${NC}"

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 no encontrado. Instala Python 3.11+${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js no encontrado. Instala Node.js 18+${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm no encontrado. Instala npm${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencias básicas verificadas${NC}"

# Crear estructura de directorios
echo -e "${YELLOW}📁 Creando estructura de proyecto...${NC}"
mkdir -p local-dev/{backend,frontend,data,logs}

# Configurar backend Python
echo -e "${YELLOW}🐍 Configurando backend Python...${NC}"
cd local-dev/backend

# Crear requirements.txt simplificado
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
structlog==23.2.0
networkx==3.2.1
numpy==1.25.2
redis==5.0.1
aiofiles==23.2.1
httpx==0.25.2
EOF

# Instalar dependencias Python
if command_exists pip; then
    pip install -r requirements.txt
else
    python3 -m pip install -r requirements.txt
fi

cd ../..

# Configurar frontend
echo -e "${YELLOW}⚛️ Configurando frontend React...${NC}"
cd local-dev/frontend

# Crear package.json simplificado
cat > package.json << 'EOF'
{
  "name": "nettwin-ui-local",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 5173",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "@tanstack/react-query": "^5.8.4",
    "axios": "^1.6.2",
    "lucide-react": "^0.294.0",
    "recharts": "^2.8.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.1.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}
EOF

# Instalar dependencias Node.js
npm install

cd ../..

echo -e "${GREEN}✅ Configuración completada!${NC}"
echo ""
echo -e "${YELLOW}🎯 Próximos pasos:${NC}"
echo "1. cd local-dev/backend && python -m uvicorn main:app --reload --port 8001"
echo "2. cd local-dev/frontend && npm run dev"
echo "3. Abrir http://localhost:5173"
echo ""
echo -e "${GREEN}🚀 NetTwinSaaS estará disponible en modo desarrollo local${NC}"