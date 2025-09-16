# 🚀 GUÍA PASO A PASO: SUBIR A RAILWAY

**Para novatos**: Cómo poner tu aplicación en la nube en 30 minutos.

## 🎯 ¿POR QUÉ RAILWAY ES PERFECTO PARA TI?

### **✅ Ventajas únicas**

- **2 clicks y funciona**: Conectar GitHub → Deploy automático
- **$5/mes todo incluido**: Base de datos + aplicación + dominio
- **Cero configuración**: Sin tocar IPs, puertos, servidores
- **Panel súper simple**: Todo visual, sin comandos raros
- **Actualizaciones automáticas**: Cambias código → Se actualiza solo

### **✅ Lo que obtienes**

```
URL final: https://tu-taller-abc123.up.railway.app
Acceso desde: Cualquier ordenador/móvil con internet
Base de datos: PostgreSQL profesional incluida
Backups: Automáticos cada día
Seguridad: HTTPS automático
```

---

## 📋 PLAN PASO A PASO (30 MINUTOS)

### **PASO 1: PREPARAR TU CÓDIGO** (5 min)

#### **1.1 Verificar que tienes estos archivos**

```
✅ app.py (tu aplicación Flask)
✅ requirements.txt (dependencias Python)
✅ Dockerfile (configuración para Railway)
✅ Tu proyecto en GitHub
```

#### **1.2 Pequeño ajuste en requirements.txt**

Añadir esta línea si no está:

```
gunicorn==20.1.0
```

### **PASO 2: CREAR CUENTA RAILWAY** (3 min)

1. Ir a: https://railway.app
2. Click "Start a New Project"
3. "Login with GitHub" (usa tu cuenta de GitHub)
4. Autorizar Railway → Listo

### **PASO 3: CONECTAR TU PROYECTO** (2 min)

1. En Railway: "New Project"
2. "Deploy from GitHub repo"
3. Buscar tu repositorio: `taller-presupuesto`
4. Click "Deploy Now"

### **PASO 4: CONFIGURAR BASE DE DATOS** (5 min)

#### **4.1 Añadir PostgreSQL**

1. En tu proyecto Railway → "New" → "Database" → "PostgreSQL"
2. Railway creará automáticamente la base de datos
3. Anotar la URL que te da (algo como: `postgresql://user:pass@host:port/db`)

#### **4.2 Configurar variables de entorno**

En Railway → Tu proyecto → "Variables":

```
DATABASE_URL = postgresql://user:pass@host:port/db (la que te dio Railway)
FLASK_ENV = production
SECRET_KEY = tu-clave-super-secreta-123
REDIS_URL = redis://redis:6379 (Railway puede dar una automática)
```

### **PASO 5: DEPLOY Y PRUEBA** (5 min)

1. Railway automáticamente construye tu aplicación
2. Te dará una URL tipo: `https://tu-app-abc123.up.railway.app`
3. Abrir esa URL → ¡Tu aplicación en vivo!

### **PASO 6: MIGRACIONES** (5 min)

#### **6.1 Ejecutar migraciones iniciales**

En Railway → Tu proyecto → "Settings" → "Environment"
Ejecutar comando:

```bash
flask db upgrade
```

### **PASO 7: ¡LISTO! PROBAR DESDE CUALQUIER SITIO** (5 min)

```
✅ Desde ordenador taller 1: https://tu-app-abc123.up.railway.app
✅ Desde ordenador taller 2: https://tu-app-abc123.up.railway.app
✅ Desde casa: https://tu-app-abc123.up.railway.app
✅ Desde móvil: https://tu-app-abc123.up.railway.app
```

---

## 🔧 CONFIGURACIONES ESPECÍFICAS

### **Archivo Railway necesario: `railway.toml`**

Crear este archivo en la raíz de tu proyecto:

```toml
[build]
builder = "DOCKERFILE"

[deploy]
startCommand = "gunicorn -w 4 -b 0.0.0.0:$PORT app:app"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### **Ajuste en Dockerfile para Railway**

Verificar que tu Dockerfile tenga:

```dockerfile
# Al final del Dockerfile:
EXPOSE $PORT
CMD gunicorn -w 4 -b 0.0.0.0:$PORT app:app
```

### **Variables de entorno completas**

```
DATABASE_URL=postgresql://... (Railway te lo da)
SECRET_KEY=mi-clave-super-secreta-12345
FLASK_ENV=production
REDIS_URL=redis://... (Railway puede darte una)
PORT=5000 (Railway lo gestiona automáticamente)
```

---

## 💰 COSTOS REALES

### **Railway Pricing**

```
Plan Hobby: $5/mes
- 512MB RAM
- 1GB Storage
- PostgreSQL incluida
- Tráfico ilimitado
- Dominio HTTPS incluido
```

### **¿Vale la pena?**

**SÍ**, porque te ahorras:

- Horas de configuración de red
- Problemas con routers/firewalls
- Mantenimiento de servidores
- Backups manuales
- Configuración HTTPS
- Problemas de "funciona en mi ordenador pero no en otros"

---

## 🚨 VENTAJAS vs SERVIDOR LOCAL

| Aspecto                    | Servidor Local                      | Railway (Nube)             |
| -------------------------- | ----------------------------------- | -------------------------- |
| **Configuración inicial**  | ❌ Compleja (IPs, puertos, routers) | ✅ 2 clicks                |
| **Acceso multi-ordenador** | ❌ Problemas de red                 | ✅ Solo abrir navegador    |
| **Acceso desde casa**      | ❌ VPN o port forwarding            | ✅ Funciona inmediatamente |
| **Mantenimiento**          | ❌ Tu responsabilidad               | ✅ Automático              |
| **Backups**                | ❌ Manual                           | ✅ Automático              |
| **Actualizaciones**        | ❌ Manual                           | ✅ Automático              |
| **Si se rompe algo**       | ❌ Arreglarlo tú                    | ✅ Soporte técnico         |
| **Costo**                  | ✅ Gratis                           | ❌ $5/mes                  |

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### **Esta semana:**

1. Crear cuenta en Railway
2. Subir aplicación básica
3. Probar acceso desde los 2 ordenadores del taller

### **Próxima semana:**

1. Probar acceso desde casa
2. Configurar dominio personalizado (opcional)
3. Hacer pruebas de carga real

### **Mes siguiente:**

1. Ver estadísticas de uso
2. Optimizar si es necesario
3. Considerar plan superior si creces

---

## 🔗 RECURSOS ÚTILES

### **Documentación Railway**

- Tutorial oficial: https://docs.railway.app/getting-started
- Deploy Flask: https://docs.railway.app/guides/flask
- Variables de entorno: https://docs.railway.app/develop/variables

### **Videos YouTube (buscar)**

- "Deploy Flask to Railway"
- "Railway vs Heroku"
- "Flask Production Deployment"

---

## 💡 TIPS FINALES

### **Para recordar**

1. **URL siempre igual**: Una vez desplegado, la URL no cambia
2. **Cambios automáticos**: Git push → Se actualiza automáticamente
3. **Logs en tiempo real**: Railway te muestra errores si algo falla
4. **Escalable**: Si creces, solo cambias de plan

### **Si algo falla**

1. Revisar logs en panel Railway
2. Verificar variables de entorno
3. Comprobar que requirements.txt esté completo
4. Contactar soporte Railway (responden rápido)

---

**🎯 CONCLUSIÓN**: Para un novato como tú, Railway es la **mejor opción**. 5€/mes te ahorran decenas de horas de configuración y problemas.
