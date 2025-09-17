# 🚀 Guía de Despliegue con GitHub Actions + Render.com

Esta guía te permitirá desplegar automáticamente tu aplicación Flask en Render.com usando GitHub Actions cada vez que hagas push a tu repositorio.

## 📋 Prerrequisitos

- ✅ GitHub Pro (que ya tienes)
- ✅ GitHub Copilot Pro (que ya tienes)
- ✅ Cuenta gratuita en [Render.com](https://render.com)

## 🔧 Paso 1: Configurar Render.com

### 1.1 Crear cuenta en Render

1. Ve a [render.com](https://render.com)
2. Haz clic en "Get Started"
3. Conecta tu cuenta de GitHub

### 1.2 Crear la base de datos PostgreSQL

1. En el dashboard de Render, haz clic en "New +"
2. Selecciona "PostgreSQL"
3. Configura:
   - **Name**: `taller-presupuesto-db`
   - **Database**: `taller_presupuesto`
   - **User**: `admin`
   - **Region**: `Frankfurt (EU Central)` (o el más cercano)
   - **Plan**: `Free`
4. Haz clic en "Create Database"
5. **IMPORTANTE**: Copia la "External Database URL" que aparece, la necesitarás después

### 1.3 Crear el Web Service

1. En el dashboard, haz clic en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio GitHub `neumaticopalmones/taller-presupuesto`
4. Configura:
   - **Name**: `taller-presupuesto`
   - **Region**: `Frankfurt (EU Central)` (misma que la BD)
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `./start.sh`
   - **Plan**: `Free`

### 1.4 Configurar Variables de Entorno

En la sección "Environment" del Web Service, agrega:

```
DATABASE_URL = [pega aquí la External Database URL que copiaste]
FLASK_ENV = production
SECRET_KEY = [genera una clave secreta aleatoria]
WEB_CONCURRENCY = 4
```

**Generar SECRET_KEY**: Ejecuta esto en tu terminal local:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## 🔧 Paso 2: Configurar GitHub Actions

### 2.1 Obtener API Key de Render

1. Ve a [Render Dashboard > Account Settings > API Keys](https://dashboard.render.com/account/api-keys)
2. Haz clic en "Create API Key"
3. Dale un nombre: `GitHub Actions Deploy`
4. Copia la API key generada

### 2.2 Obtener Service ID

1. Ve a tu Web Service en Render
2. En la URL verás algo como: `https://dashboard.render.com/web/srv-xxxxxxxxxxxxx`
3. Copia la parte `srv-xxxxxxxxxxxxx` (ese es tu Service ID)

### 2.3 Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Ir a **Settings** > **Secrets and variables** > **Actions**
3. Agrega estos secrets:
   - `RENDER_API_KEY`: La API key que copiaste
   - `RENDER_SERVICE_ID`: El Service ID que copiaste

## 🔧 Paso 3: Hacer el primer despliegue

### 3.1 Subir cambios a GitHub

```bash
git add .
git commit -m "feat: configuración completa para despliegue en Render"
git push origin main
```

### 3.2 Verificar el workflow

1. Ve a tu repositorio en GitHub
2. Haz clic en la pestaña **Actions**
3. Verás que se ejecuta automáticamente el workflow "Deploy to Render"
4. El workflow incluye:
   - ✅ Tests automáticos
   - ✅ Linting de código
   - ✅ Verificación de seguridad
   - ✅ Despliegue automático a Render

### 3.3 Verificar despliegue en Render

1. Ve a tu Web Service en Render
2. En la pestaña "Deploys" verás el progreso
3. Una vez completado, haz clic en la URL de tu aplicación

## 🔧 Paso 4: Configuración adicional (opcional)

### 4.1 Dominio personalizado

Si quieres un dominio propio:

1. En Render, ve a tu Web Service > Settings > Custom Domains
2. Agrega tu dominio
3. Configura los DNS según las instrucciones

### 4.2 Monitoreo

- Los logs se ven en Render Dashboard > tu servicio > Logs
- GitHub Actions te notificará por email si falla el despliegue
- Render enviará notificaciones si el servicio se cae

## 🚨 Solución de problemas

### Error: "Database connection failed"

- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que la base de datos y el web service estén en la misma región

### Error: "Build failed"

- Revisa los logs en GitHub Actions
- Verifica que `requirements.txt` esté actualizado

### Error: "Start command failed"

- Verifica que `start.sh` tenga permisos de ejecución
- Revisa los logs en Render Dashboard

## 📈 Flujo de trabajo diario

Una vez configurado, tu flujo será:

1. **Desarrollas local**: Haces cambios en tu código
2. **Push a GitHub**: `git push origin main`
3. **Automático**: GitHub Actions ejecuta tests y despliega
4. **Listo**: Tu app se actualiza automáticamente en Render

## 🎯 Ventajas de este setup

- ✅ **Despliegue automático**: Sin pasos manuales
- ✅ **Tests antes de deploy**: Evita bugs en producción
- ✅ **Rollback automático**: Si algo falla, no se despliega
- ✅ **Logs centralizados**: Todo en un lugar
- ✅ **Escalable**: Fácil agregar más environments
- ✅ **Profesional**: Flujo usado en empresas reales

## 🔗 URLs importantes

- **Tu aplicación**: `https://taller-presupuesto.onrender.com`
- **Render Dashboard**: `https://dashboard.render.com`
- **GitHub Actions**: `https://github.com/neumaticopalmones/taller-presupuesto/actions`

¡Ya tienes un pipeline de CI/CD profesional! 🚀
