# NetTwinSaaS - Desarrollo Local Sin Docker

Esta configuración te permite ejecutar NetTwinSaaS localmente sin Docker, usando solo Python y Node.js nativos.

## 🚀 Inicio Rápido

### 1. Configuración Inicial
```bash
# Ejecutar script de configuración
chmod +x local-setup.sh
./local-setup.sh
```

### 2. Iniciar Servicios
```bash
# Opción A: Script automático (recomendado)
chmod +x local-dev/start-dev.sh
./local-dev/start-dev.sh

# Opción B: Manual en terminales separadas
# Terminal 1 - Backend
cd local-dev/backend
python main.py

# Terminal 2 - Frontend  
cd local-dev/frontend
npm run dev
```

### 3. Acceder a la Aplicación
- **Frontend**: http://localhost:5173
- **API Backend**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs
- **Credenciales**: demo/demo

## 🏗️ Arquitectura Local

```
┌─────────────────────────────────────────┐
│ Frontend React (Puerto 5173)           │
│ - Dashboard con métricas               │
│ - Visualización de topología          │
│ - Simulaciones what-if                 │
│ - Gestión de configuraciones          │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST API
┌─────────────────▼───────────────────────┐
│ Backend FastAPI (Puerto 8001)          │
│ - Autenticación JWT                    │
│ - Motor de simulaciones                │
│ - Generador de configuraciones        │
│ - Almacenamiento en memoria           │
└─────────────────────────────────────────┘
```

## 🎯 Funcionalidades Disponibles

### ✅ Completamente Funcional
- **Autenticación**: Login con demo/demo
- **Descubrimiento**: Topología sintética de 5 routers
- **Simulaciones**: Análisis de impacto what-if
- **Configuraciones**: Generación de templates QoS
- **Métricas**: Dashboard con datos en tiempo real
- **API REST**: Endpoints completos con documentación

### 🔄 Datos Sintéticos
- 5 routers (R1-R5) con enlaces realistas
- Métricas de utilización, latencia, pérdida
- Simulaciones con análisis de riesgo
- Configuraciones QoS para Cisco/Juniper

## 📊 Demo Flow

1. **Login**: http://localhost:5173 → demo/demo
2. **Topology**: Ver red de 5 routers descubierta
3. **Simulations**: Ejecutar "add_link R1-R3 1000Mbps"
4. **Configurations**: Generar configs QoS para VoIP
5. **Monitoring**: Ver métricas en tiempo real

## 🛠️ Comandos Útiles

```bash
# Ver logs del backend
cd local-dev/backend && python main.py

# Reinstalar dependencias frontend
cd local-dev/frontend && npm install

# Verificar API
curl http://localhost:8001/health

# Ver documentación interactiva
open http://localhost:8001/docs
```

## 🔧 Personalización

### Modificar Topología
Edita `generate_synthetic_topology()` en `local-dev/backend/main.py`:
```python
# Agregar más routers
for i in range(1, 8):  # Cambiar a 7 routers
    node = {...}

# Modificar enlaces
connections = [
    ("R1", "R6", 2000, 0.25),  # Nuevo enlace
    # ...
]
```

### Cambiar Configuraciones
Modifica `cisco_qos_config` en `generate_config()` para diferentes templates.

### Ajustar Métricas
Personaliza rangos en `get_system_metrics()` y `get_network_metrics()`.

## 🚨 Limitaciones

- **Sin persistencia**: Datos se pierden al reiniciar
- **Sin Redis/Neo4j**: Todo en memoria Python
- **Sin Kafka**: Eventos síncronos
- **Sin Ansible real**: Solo templates mockados

## 🔄 Migración a Producción

Para migrar a la versión completa con Docker:
```bash
# Volver al directorio raíz
cd ..

# Usar la configuración Docker original
docker compose up --build
```

## 📝 Troubleshooting

### Puerto ocupado
```bash
# Verificar qué usa el puerto
lsof -i :8001
lsof -i :5173

# Matar proceso
kill -9 <PID>
```

### Dependencias faltantes
```bash
# Reinstalar Python
cd local-dev/backend
pip install -r requirements.txt

# Reinstalar Node.js
cd local-dev/frontend  
npm install
```

### CORS errors
Verifica que el proxy en `vite.config.ts` apunte a `http://localhost:8001`.