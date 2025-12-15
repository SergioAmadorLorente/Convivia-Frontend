# Actualización: Dashboard Muestra Espacio del Usuario

## 📋 Objetivo
Hacer que el Dashboard muestre automáticamente el nombre del espacio (residencia) al que está asociado el usuario autenticado.

## ✅ Cambios Realizados

### 1. **Archivo: `src/api/usuarioEspacio.ts`**

#### Nueva función agregada:

**`obtenerEspacioPorUsuarioId(usuarioId)`**
- Busca la relación UsuarioEspacio para un usuario específico
- Obtiene los datos completos del espacio asociado
- Retorna: `{ ...relacionUsuario, espacio: { id, nombre, direccion } }` o `null` si no tiene espacio

```typescript
export const obtenerEspacioPorUsuarioId = async (usuarioId: string) => {
    // 1. Obtiene todas las relaciones UsuarioEspacio
    // 2. Busca la que corresponde al usuarioId
    // 3. Obtiene los datos completos del espacio
    // 4. Retorna la relación con el espacio incluido
}
```

### 2. **Archivo: `src/screens/Dashboard/DashBoardPersonal.tsx`**

#### Imports agregados:
```typescript
import { useState, useEffect } from "react";
import { auth } from "../../configs/firebaseConfig";
import { obtenerEspacioPorUsuarioId } from "../../api/usuarioEspacio";
```

#### Estados agregados:
```typescript
const [nombreEspacio, setNombreEspacio] = useState<string>("Cargando...");
const [nombreUsuario, setNombreUsuario] = useState<string>("@usuario");
const [loadingEspacio, setLoadingEspacio] = useState<boolean>(true);
```

#### useEffect agregado:
Se ejecuta al montar el componente y:
1. ✅ Obtiene el usuario autenticado de Firebase
2. ✅ Extrae el nombre de usuario del email
3. ✅ Llama a `obtenerEspacioPorUsuarioId()` con el UID del usuario
4. ✅ Actualiza el estado con el nombre del espacio
5. ✅ Maneja casos de error y usuario sin espacio

#### Header actualizado:
```typescript
// Antes (valores estáticos):
<Header
  username="@usuario"
  date="Miércoles, 15 de Septiembre"
  location="Piso Tarragona"
/>

// Después (valores dinámicos):
<Header
  username={nombreUsuario}
  date={new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  })}
  location={nombreEspacio}
/>
```

## 🔄 Flujo Completo

```
1. Usuario abre Dashboard
         ↓
2. useEffect se ejecuta
         ↓
3. Obtiene usuario de Firebase (auth.currentUser)
         ↓
4. Extrae nombre de usuario del email
         ↓
5. Llama a obtenerEspacioPorUsuarioId(user.uid)
         ↓
    ┌─────────────────────────────────┐
    │ GET /api/UsuarioEspacio (todos) │
    └─────────────────────────────────┘
         ↓
    ┌─────────────────────────────────┐
    │ Busca relación con usuarioId    │
    └─────────────────────────────────┘
         ↓
    ┌─────────────────────────────────┐
    │ GET /api/Espacio/{espacioId}    │
    └─────────────────────────────────┘
         ↓
6. Actualiza estados:
   - nombreUsuario: "@email"
   - nombreEspacio: "Piso Tarragona"
         ↓
7. Header muestra datos dinámicos
```

## 📊 Casos Manejados

### ✅ Usuario con espacio asignado
```
Header muestra:
- username: "@fernando.ortiz"
- date: "domingo, 15 de diciembre"
- location: "Piso Tarragona"
```

### ⚠️ Usuario sin espacio asignado
```
Header muestra:
- username: "@fernando.ortiz"
- date: "domingo, 15 de diciembre"
- location: "Sin espacio asignado"
```

### ❌ Usuario no autenticado
```
Header muestra:
- username: "@usuario"
- date: "domingo, 15 de diciembre"
- location: "Sin espacio"
```

### ⚠️ Error al cargar
```
Header muestra:
- username: "@usuario"
- date: "domingo, 15 de diciembre"
- location: "Error al cargar"
```

## 🎯 Beneficios

1. **Personalización**: El usuario ve su nombre y espacio real
2. **Fecha actual**: Siempre muestra la fecha correcta
3. **Feedback visual**: Loading state mientras carga los datos
4. **Manejo de errores**: Mensajes claros para cada caso
5. **Experiencia mejorada**: El usuario sabe inmediatamente en qué espacio está

## 🔍 Logs en Consola

El componente registra información útil:

```javascript
// Éxito:
"Espacio cargado: { id: '123', nombre: 'Piso Tarragona', direccion: '...' }"

// Sin espacio:
"Usuario no tiene espacio asignado"

// Sin autenticación:
"No hay usuario autenticado"

// Error:
"Error al cargar espacio del usuario: [error details]"
```

## ⚠️ Consideraciones

### Rendimiento
- La función `obtenerEspacioPorUsuarioId` obtiene TODAS las relaciones UsuarioEspacio
- **Recomendación**: Crear un endpoint en el backend `/api/UsuarioEspacio/ByUsuario/{usuarioId}` para optimizar

### Actualización en tiempo real
- Los datos se cargan solo al montar el componente
- Si el usuario crea un espacio, necesita recargar el Dashboard
- **Recomendación**: Usar un contexto global o React Query para sincronizar el estado

### Formato de fecha
- Usa `toLocaleDateString('es-ES')` para español
- Formato: "domingo, 15 de diciembre"
- Se capitaliza automáticamente en algunos navegadores

## 🚀 Próximos Pasos Sugeridos

1. **Backend**: Crear endpoint `/api/UsuarioEspacio/ByUsuario/{usuarioId}` para optimizar
2. **Contexto**: Crear un contexto global `UserSpaceContext` para compartir el espacio entre componentes
3. **Refresh**: Agregar pull-to-refresh para actualizar los datos
4. **Cache**: Implementar caché local para evitar llamadas innecesarias
5. **Navegación**: Redirigir automáticamente a "Crear/Unirse a espacio" si no tiene uno asignado

## 📝 Ejemplo de Respuesta de la API

### obtenerEspacioPorUsuarioId("firebase-uid-123")

**Respuesta exitosa:**
```json
{
  "id": "relacion-uuid-456",
  "usuarioId": "firebase-uid-123",
  "espacioId": "espacio-uuid-789",
  "rol": "admin",
  "ausente": false,
  "karma": 0,
  "espacio": {
    "id": "espacio-uuid-789",
    "nombre": "Piso Tarragona",
    "direccion": "Calle Ejemplo 123"
  }
}
```

**Usuario sin espacio:**
```json
null
```

## 🧪 Cómo Probar

1. **Iniciar sesión** con un usuario que tiene espacio asignado
2. **Navegar** al Dashboard
3. **Verificar** que el Header muestra:
   - Tu nombre de usuario (del email)
   - La fecha actual en español
   - El nombre de tu espacio
4. **Revisar consola** para ver los logs
5. **Probar** con un usuario sin espacio para ver "Sin espacio asignado"

## 🔗 Relación con Cambios Anteriores

Este cambio complementa la funcionalidad implementada anteriormente:

1. **Crear espacio** (`crearEspacioConUsuario`) → Crea el espacio y la relación
2. **Mostrar espacio** (`obtenerEspacioPorUsuarioId`) → Muestra el espacio en el Dashboard

Ahora el flujo completo es:
```
Usuario crea espacio → Relación se crea → Dashboard muestra el espacio
```

---

**Fecha de implementación**: 2025-12-15
**Archivos modificados**: 2
**Funciones agregadas**: 1
**Estados agregados**: 3
**Complejidad**: Media-Alta
