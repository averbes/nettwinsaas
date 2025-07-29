#!/bin/bash
# NetTwinSaaS - Script de inicio para desarrollo local

echo "🚀 Iniciando NetTwinSaaS en modo desarrollo local..."

# Función para matar procesos al salir
cleanup() {
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Verificar que estamos en el directorio correcto
if [ ! -d "local-dev" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Iniciar backend
echo "🐍 Iniciando backend API en puerto 8001..."
cd local-dev/backend
python main.py &
BACKEND_PID=$!
cd ../..

# Esperar a que el backend esté listo
sleep 3

# Iniciar frontend
echo "⚛️ Iniciando frontend React en puerto 5173..."
cd local-dev/frontend
npm run dev &
FRONTEND_PID=$!
cd ../..

echo ""
echo "✅ NetTwinSaaS está ejecutándose:"
echo "   🌐 Frontend: http://localhost:5173"
echo "   🔧 API Backend: http://localhost:8001"
echo "   📖 API Docs: http://localhost:8001/docs"
echo ""
echo "👤 Credenciales de demo: demo/demo"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"

# Esperar indefinidamente
wait