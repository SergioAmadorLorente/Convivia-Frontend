# Guía: Crear Espacio con Usuario

## Descripción General

Esta guía explica cómo un usuario existente puede crear su espacio (residencia) y establecer automáticamente la relación entre el usuario y el espacio.

## Arquitectura

### Archivos API

1. **`usuario.ts`**: Maneja operaciones CRUD de usuarios
2. **`espacio.ts`**: Maneja operaciones CRUD de espacios + función especial `crearEspacioConUsuario`
3. **`usuarioEspacio.ts`**: Maneja la relación entre usuarios y espacios

### Flujo de Creación

```
Usuario Autenticado
        ↓
Crear Espacio (nombre, dirección)
        ↓
crearEspacioConUsuario()
        ↓
    ┌───────────────────┐
    │ 1. Crear Espacio  │
    └───────────────────┘
            ↓
    ┌───────────────────────────┐
    │ 2. Crear UsuarioEspacio   │
    │    - usuarioId            │
    │    - espacioId            │
    │    - rol: "admin"         │
    │    - ausente: false       │
    │    - karma: 0             │
    └───────────────────────────┘
            ↓
    Retorna ambos objetos
```

## Uso en Componentes

### Ejemplo 1: Crear espacio desde NuevaResidencia.tsx

```typescript
import { crearEspacioConUsuario } from '../api/espacio';
import { auth } from '../configs/firebaseConfig';

const handleCrearResidencia = async () => {
    try {
        // Obtener el usuario autenticado
        const user = auth.currentUser;
        
        if (!user) {
            console.error("No hay usuario autenticado");
            return;
        }

        // Datos del espacio
        const espacioData = {
            nombre: nombreResidencia,
            direccion: direccionResidencia,
        };

        // Crear espacio y relación automáticamente
        const resultado = await crearEspacioConUsuario(
            espacioData,
            user.uid,  // ID del usuario de Firebase
            "admin"    // Rol del usuario (opcional, por defecto es "admin")
        );

        console.log("Espacio creado:", resultado.espacio);
        console.log("Relación creada:", resultado.usuarioEspacio);

        // Navegar al dashboard o mostrar confirmación
        navigation.navigate('DashboardPersonal');
        
    } catch (error) {
        console.error("Error al crear residencia:", error);
        // Mostrar mensaje de error al usuario
    }
};
```

### Ejemplo 2: Usar solo la función básica (si necesitas más control)

```typescript
import { crearEspacio } from '../api/espacio';
import { crearUsuarioEspacio } from '../api/usuarioEspacio';

const handleCrearResidenciaManual = async () => {
    try {
        const user = auth.currentUser;
        
        if (!user) return;

        // 1. Crear el espacio primero
        const espacio = await crearEspacio({
            nombre: nombreResidencia,
            direccion: direccionResidencia,
        });

        // 2. Crear la relación manualmente
        const relacion = await crearUsuarioEspacio({
            usuarioId: user.uid,
            espacioId: espacio.id,
            rol: "admin",
            ausente: false,
            karma: 0,
        });

        console.log("Todo creado correctamente");
        
    } catch (error) {
        console.error("Error:", error);
    }
};
```

## Interfaces TypeScript

### EspacioPayload
```typescript
{
    nombre: string;      // Nombre de la residencia
    direccion: string;   // Dirección de la residencia
}
```

### EspacioResponse
```typescript
{
    id: string;          // ID generado por el backend
    nombre: string;
    direccion: string;
}
```

### UsuarioEspacioPayload
```typescript
{
    usuarioId: string;      // ID del usuario (Firebase UID)
    espacioId: string;      // ID del espacio creado
    rol: string;            // "admin", "miembro", etc.
    ausente?: boolean;      // Opcional, por defecto false
    karma?: number;         // Opcional, por defecto 0
    tareasId?: string[];    // Opcional
    permisoId?: string;     // Opcional
    facturasId?: string[];  // Opcional
}
```

## Funciones Disponibles en espacio.ts

### CRUD Básico
- `crearEspacio(data)` - Crea un espacio
- `obtenerEspacios()` - Obtiene todos los espacios
- `obtenerEspacioPorId(id)` - Obtiene un espacio específico
- `actualizarEspacio(id, data)` - Actualiza un espacio
- `eliminarEspacio(id)` - Elimina un espacio

### Función Especial
- `crearEspacioConUsuario(espacioData, usuarioId, rol?)` - Crea espacio y relación automáticamente

## Manejo de Errores

```typescript
try {
    const resultado = await crearEspacioConUsuario(espacioData, userId);
    // Éxito
} catch (error) {
    if (error.response) {
        // Error del servidor (400, 500, etc.)
        console.error("Error del servidor:", error.response.data);
    } else if (error.request) {
        // No se recibió respuesta
        console.error("No hay respuesta del servidor");
    } else {
        // Error en la configuración
        console.error("Error:", error.message);
    }
}
```

## Validaciones Recomendadas

Antes de crear un espacio, valida:

1. ✅ Usuario autenticado (`auth.currentUser !== null`)
2. ✅ Nombre de residencia no vacío
3. ✅ Dirección no vacía
4. ✅ Usuario no tiene ya un espacio asignado (opcional)

## Próximos Pasos

1. Implementar la función en `NuevaResidencia.tsx`
2. Agregar validaciones de formulario
3. Mostrar feedback visual (loading, success, error)
4. Actualizar el estado global/contexto con el nuevo espacio
5. Redirigir al dashboard después de crear el espacio

## Notas Importantes

- La función `crearEspacioConUsuario` es **atómica** en el sentido de que si falla la creación de la relación, el espacio ya estará creado. Considera implementar un rollback en el backend si es crítico.
- El rol por defecto es `"admin"` para el creador del espacio.
- El `usuarioId` debe ser el UID de Firebase, no el ID del backend.
