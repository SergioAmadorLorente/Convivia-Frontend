# Contexto Global de Usuario

## Descripción

El `UserContext` proporciona acceso global a la información completa del usuario autenticado en toda la aplicación.

## Uso

### Importar el hook

```typescript
import { useUser } from "../hooks";
// o directamente:
// import { useUser } from '../contexts/UserContext';
```

### Obtener datos del usuario

```typescript
const MiComponente = () => {
  const { firebaseUser, userData, loading, refreshUserData } = useUser();

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!firebaseUser) {
    return <Text>No hay usuario autenticado</Text>;
  }

  return (
    <View>
      {/* Datos de Firebase Auth */}
      <Text>UID: {firebaseUser.uid}</Text>
      <Text>Email: {firebaseUser.email}</Text>

      {/* Datos completos de la base de datos */}
      {userData && (
        <>
          <Text>Nombre: {userData.nombre}</Text>
          <Text>Teléfono: {userData.telefono}</Text>
          <Text>Premium: {userData.premium ? 'Sí' : 'No'}</Text>
        </>
      )}
    </View>
  );
};
```

### Propiedades disponibles

- **`firebaseUser`**: Objeto `User` de Firebase Auth (uid, email, emailVerified, etc.)
- **`userData`**: Objeto completo del usuario desde la base de datos (nombre, teléfono, premium, etc.)
- **`loading`**: Boolean que indica si se están cargando los datos
- **`refreshUserData()`**: Función para refrescar manualmente los datos del usuario desde la BD

### Refrescar datos del usuario

```typescript
const actualizarPerfil = async () => {
  await actualizarUsuario(userData.id, { nombre: nuevoNombre });
  await refreshUserData(); // Recargar datos desde la BD
};
```

## Reemplazo de `useAuthListener`

**Antes:**

```typescript
const user = useAuthListener(); // Solo obtenías el User de Firebase
if (user?.uid) {
  // Tenías que hacer fetch manual del usuario completo
}
```

**Ahora:**

```typescript
const { firebaseUser, userData } = useUser();
// Ya tienes acceso a todos los datos sin fetch manual
```

## Estructura de datos

### firebaseUser (Firebase Auth)

```typescript
{
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  // ... otros campos de Firebase User
}
```

### userData (Base de datos)

```typescript
{
  id: string;
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  premium?: boolean;
}
```
