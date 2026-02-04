## Verificación de Seguridad de la Base de Datos

Para garantizar que la aplicación se conecta de forma segura a la base de datos, se ha creado un rol específico `app_user` con permisos de solo lectura sobre las vistas de reportes, sin acceso a las tablas subyacentes.

Puedes verificar estos permisos conectándote a la base de datos con `psql` y ejecutando las siguientes consultas como el usuario `app_user`.

### 1. Conectarse como `app_user`

Primero, obtén el nombre del contenedor de la base de datos:

```bash
docker ps
```

Luego, conéctate a la base de datos usando el rol `app_user`. Se te pedirá la contraseña que definiste en `db/roles.sql`.

```bash
# Reemplaza <nombre_del_contenedor_db> con el nombre real
docker exec -it <nombre_del_contenedor_db> psql -U app_user -d postgres
```

### 2. Intentar Consultar una VISTA (Debería funcionar)

Una vez dentro de `psql`, ejecuta una consulta sobre una de las vistas permitidas.

```sql
-- Esta consulta DEBE funcionar.
SELECT * FROM vw_member_activity LIMIT 5;
```

El resultado debería ser una tabla con la actividad de los miembros.

### 3. Intentar Consultar una TABLA (Debería fallar)

Ahora, intenta acceder directamente a una de las tablas base.

```sql
-- Esta consulta DEBE fallar.
SELECT * FROM members LIMIT 5;
```

Esta consulta debería fallar y devolver un error de **`permission denied for table members`**, demostrando que el usuario `app_user` no tiene acceso a las tablas directamente, como se requiere.

```
ERROR:  permission denied for table members
```

Esta verificación confirma que la configuración de seguridad es correcta.