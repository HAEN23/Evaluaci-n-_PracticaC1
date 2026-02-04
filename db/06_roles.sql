-- 1. Crear un rol/usuario específico para la aplicación.
-- Se usa LOGIN para que pueda iniciar sesión.
-- CAMBIA 'tu_password_seguro' por una contraseña real, idealmente gestionada con secrets.
CREATE ROLE app_user WITH LOGIN PASSWORD 'tu_password_seguro';

-- 2. Revocar todos los privilegios por defecto del esquema public.
-- Esto asegura que el nuevo rol no tenga permisos no deseados.
REVOKE ALL ON SCHEMA public FROM app_user;

-- 3. Otorgar permiso de USAGE en el esquema public.
-- Esto es necesario para que el rol pueda "ver" los objetos dentro del esquema.
GRANT USAGE ON SCHEMA public TO app_user;

-- 4. Otorgar permiso de SELECT únicamente sobre las VISTAS de reportes.
GRANT SELECT ON vw_most_borrowed_books TO app_user;
GRANT SELECT ON vw_overdue_loans TO app_user;
GRANT SELECT ON vw_fines_summary TO app_user;
GRANT SELECT ON vw_member_activity TO app_user;
GRANT SELECT ON vw_inventory_health TO app_user;

-- 5. Revocar permisos de las tablas base (asegurarse que el usuario no pueda acceder a las tablas directamente).
-- IMPORTANTE: Esto debe hacerse ANTES de otorgar permisos a las vistas, o usar nombres específicos de tablas.
-- Por seguridad, revocamos acceso a tablas específicas en lugar de usar "ALL TABLES"
REVOKE SELECT ON books, members, loans, fines FROM app_user;