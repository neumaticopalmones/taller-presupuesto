# 🌐 PLAN MULTI-ORDENADOR

Cómo usar la aplicación desde varios ordenadores (taller + casa).

## 🎯 ESCENARIOS

### **Taller**: 2 ordenadores en red local

### **Casa**: Acceso remoto desde tu casa

---

## 🏆 OPCIÓN 1: NUBE (RECOMENDADO PARA NOVATOS)

### **Concepto**

- Subir aplicación a servidor cloud profesional
- Acceder desde cualquier ordenador con solo abrir navegador
- URL única tipo: `https://tu-taller.railway.app`

### **Ventajas para novatos**

✅ **CERO configuración de red**: Sin IPs, puertos, routers
✅ **Funciona inmediatamente**: Solo crear cuenta y subir
✅ **Acceso universal**: Taller, casa, móvil, cualquier sitio
✅ **Backups automáticos**: El servicio se encarga
✅ **HTTPS incluido**: Seguridad automática
✅ **Sin mantenimiento**: Actualizaciones automáticas del servidor
✅ **Soporte técnico**: Si hay problemas, ellos ayudan

### **Desventajas**

❌ Costo: ~5-15€/mes (como un Netflix)
❌ Necesitas internet para trabajar

### **SERVICIOS RECOMENDADOS PARA NOVATOS**

#### 🥇 **RAILWAY** (MÁS FÁCIL)

- **Precio**: $5/mes (~5€)
- **Por qué es perfecto para ti**:
  - Conecta directamente con tu GitHub
  - Deploy automático en 2 clicks
  - Panel muy simple
  - Soporte en español

#### 🥈 **RENDER** (ALTERNATIVA FÁCIL)

- **Precio**: $7/mes (~6.5€)
- **Por qué es bueno**:
  - Interfaz muy intuitiva
  - Base de datos PostgreSQL incluida gratis
  - Deploy muy simple

#### 🥉 **HEROKU** (CONOCIDO)

- **Precio**: $7/mes (~6.5€)
- **Por qué puede gustar**:
  - Muy conocido y estable
  - Documentación extensa

---

## � OPCIÓN 2: SERVIDOR DEDICADO (MÁS COMPLEJO)

### **Concepto**

- **Ordenador 1 (Servidor)**: Ejecuta la aplicación completa
- **Ordenador 2 + Casa**: Solo navegador web conectándose al Servidor

### **Ventajas**

✅ Simple de configurar
✅ Una sola base de datos (sin sincronización)
✅ Todos ven los mismos datos en tiempo real
✅ Fácil backup (solo un sitio)

### **Desventajas**

❌ Si el servidor se apaga, nadie puede trabajar
❌ Internet lento puede afectar acceso desde casa

---

## 📋 PLAN DE IMPLEMENTACIÓN - OPCIÓN 1

### **FASE 1: PREPARAR SERVIDOR (Ordenador principal del taller)**

#### **1.1 Configurar Docker para red externa**

**Archivo actual**: `docker-compose.yml`
**Cambio necesario**: Permitir acceso desde otros IPs

```yaml
# Cambiar de:
ports:
  - "5000:5000"

# A:
ports:
  - "0.0.0.0:5000:5000"  # Permite acceso desde cualquier IP
```

#### **1.2 Configurar Firewall Windows**

```cmd
# Abrir puerto 5000 en Windows Firewall
netsh advfirewall firewall add rule name="Taller App" dir=in action=allow protocol=TCP localport=5000
```

#### **1.3 Configurar IP fija**

**Opción A - IP estática manual:**

```
Servidor: 192.168.1.100 (ejemplo)
```

**Opción B - Reserva DHCP en router:**

- Reservar IP para MAC address del servidor

### **FASE 2: CONFIGURAR CLIENTES**

#### **2.1 Ordenador 2 del taller**

```
URL: http://192.168.1.100:5000
```

#### **2.2 Acceso desde casa**

**Opción A - VPN:**

- Instalar VPN en router (OpenVPN, Wireguard)
- Conectar desde casa → Usar IP local: `http://192.168.1.100:5000`

**Opción B - Port Forwarding:**

- Router: Puerto externo 8080 → Puerto interno 5000
- Desde casa: `http://tu-ip-publica:8080`

**Opción C - Servicio túnel (ngrok, CloudFlare Tunnel):**

- Más fácil pero requiere servicio externo

---

## 🟡 OPCIÓN 2: APLICACIÓN EN LA NUBE

### **Concepto**

- Subir aplicación a servidor cloud (DigitalOcean, AWS, etc.)
- Todos se conectan por internet

### **Ventajas**

✅ Acceso desde cualquier sitio
✅ No depende de ordenadores del taller
✅ Backups automáticos
✅ Sin configuración de red local

### **Desventajas**

❌ Costo mensual (~5-20€/mes)
❌ Requiere configuración inicial más compleja
❌ Dependes de internet

### **Servicios recomendados**

- **Railway** (~$5/mes) - Más fácil
- **DigitalOcean** (~$6/mes) - Más control
- **Heroku** (~$7/mes) - Muy fácil

---

## 🔴 OPCIÓN 3: MÚLTIPLES INSTALACIONES + SINCRONIZACIÓN

### **Concepto**

- Cada ordenador tiene su propia aplicación
- Sincronizar base de datos entre ellos

### **Ventajas**

✅ Funciona sin internet
✅ Redundancia (si uno falla, otros siguen)

### **Desventajas**

❌ Muy complejo de configurar
❌ Problemas de sincronización
❌ Conflictos de datos
❌ Múltiples backups que gestionar

**❌ NO RECOMENDADO** para tu caso

---

## 🎯 RECOMENDACIÓN ESPECÍFICA

### **Para ti sugiero: OPCIÓN 1 (Servidor dedicado)**

**Razones:**

1. **Simple**: Cambios mínimos en tu aplicación actual
2. **Económico**: Sin costos mensuales
3. **Control total**: Todo en tu taller
4. **Fácil backup**: Un solo sitio

### **Plan paso a paso:**

#### **📅 SEMANA 1: Preparación**

1. Elegir ordenador más potente como servidor
2. Configurar IP fija
3. Modificar `docker-compose.yml`
4. Abrir puerto en firewall

#### **📅 SEMANA 2: Pruebas locales**

1. Probar acceso desde segundo ordenador del taller
2. Verificar que ambos pueden usar la aplicación
3. Hacer backup de datos

#### **📅 SEMANA 3: Acceso remoto**

1. Configurar VPN en router (recomendado)
2. O configurar port forwarding
3. Probar acceso desde casa

---

## 🔧 CONFIGURACIONES ESPECÍFICAS

### **Router del taller**

**Para VPN (recomendado):**

```
OpenVPN o Wireguard habilitado
Puerto VPN: 1194 abierto
```

**Para Port Forwarding (alternativa):**

```
Puerto externo: 8080
Puerto interno: 5000
IP destino: 192.168.1.100 (servidor)
```

### **Modificación docker-compose.yml**

```yaml
web:
  image: aplicacionjavascripypython-web
  container_name: taller_web
  restart: unless-stopped
  depends_on:
    - db
    - redis
  ports:
    - "0.0.0.0:5000:5000" # ← CAMBIO IMPORTANTE
  volumes:
    - ./:/app
  command: gunicorn -w 4 -k gthread -b 0.0.0.0:5000 app:app
```

### **Configuración Caddy para múltiples IPs**

```
# Caddyfile
:80 {
    reverse_proxy web:5000
}
```

---

## 🚨 CONSIDERACIONES DE SEGURIDAD

### **Red local (taller)**

✅ Generalmente segura

### **Acceso desde casa**

- **VPN**: ✅ Muy segura
- **Port forwarding**: ⚠️ Añadir autenticación
- **Túnel**: ✅ Relativamente segura

### **Sugerencias:**

1. Cambiar puerto por defecto (5000 → 8080)
2. Añadir usuario/contraseña básica
3. HTTPS con certificado (usar Caddy correctamente)

---

## 📱 ALTERNATIVA MÓVIL

### **Bonus: Acceso desde móvil**

Una vez configurado, también podrás usar la aplicación desde:

- Móvil en el taller (WiFi local)
- Móvil desde casa (VPN o puerto abierto)

---

## 🎯 PRÓXIMOS PASOS SUGERIDOS

### **Hoy/Mañana:**

1. Decidir qué ordenador será el servidor
2. Anotar IP actual de ese ordenador
3. Añadir este plan al backlog

### **Esta semana:**

1. Implementar cambios en `docker-compose.yml`
2. Configurar firewall
3. Probar desde segundo ordenador

### **Próxima semana:**

1. Configurar acceso desde casa
2. Hacer pruebas completas
3. Documentar IPs y configuraciones

---

**💡 TIP**: Empieza con la red local del taller. Una vez que funcione bien, añade el acceso desde casa.
