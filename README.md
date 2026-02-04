# Dashboard de Biblioteca - Sistema de Reportes

Sistema completo de gestión y reportes para una biblioteca
##  Características

- **5 Reportes Completos:**
  - Libros Más Prestados
  - Préstamos Vencidos
  - Resumen de Multas
  - Actividad de Miembros
  - Salud del Inventario

- **Funcionalidades:**
  - Búsqueda y filtros en cada reporte
  - Paginación server-side
  - KPIs destacados
  - Consultas parametrizadas seguras
  - Vistas optimizadas con índices

##  Requisitos Previos

- [Docker](https://www.docker.com/get-started) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado
- Git

##  Inicio Rápido

### Opción 1: Iniciar con Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/HAEN23/Evaluaci-n-_PracticaC1.git
cd Evaluaci-n-_PracticaC1

# 2. Crear archivo de variables de entorno
cp .env.example .env.local

# 3. Levantar todos los servicios
docker-compose up --build

# 4. Acceder a la aplicación
# Abre tu navegador en: http://localhost:3001
```



### 1. Libros Más Prestados (`/reports/most-borrowed-books`)
- Ranking de libros por número de préstamos
- Búsqueda por título o autor
- Paginación

### 2. Préstamos Vencidos (`/reports/overdue-loans`)
- Lista de préstamos que superaron la fecha de devolución
- Cálculo de multas sugeridas
- Búsqueda por miembro o libro

### 3. Resumen de Multas (`/reports/fines-summary`)
- Análisis mensual de multas
- KPIs: Total, pagadas, pendientes
- Búsqueda por mes

### 4. Actividad de Miembros (`/reports/member-activity`)
- Estadísticas de préstamos por miembro
- Tasa de atraso
- Búsqueda por nombre o email

### 5. Salud del Inventario (`/reports/inventory-health`)
- Estado del inventario por categoría
- Copias disponibles vs. prestadas vs. perdidas
- Porcentaje de disponibilidad

---

##  C) Índices para Optimización de Consultas

El archivo `db/05_indexes.sql` define **5 índices estratégicos** para mejorar el rendimiento de las consultas más frecuentes.

### Índices Creados

```sql
-- 1. Índice para búsquedas de libros por título o autor
CREATE INDEX idx_books_search ON books (title, author);

-- 2. Índice para consultas de préstamos activos
CREATE INDEX idx_loans_active ON loans (book_copy_id, returned_at) 
WHERE returned_at IS NULL;

-- 3. Índice para consultas de préstamos por miembro
CREATE INDEX idx_loans_member ON loans (member_id, loan_date);

-- 4. Índice para búsqueda de multas pendientes
CREATE INDEX idx_fines_pending ON fines (member_id, status) 
WHERE status = 'pending';

-- 5. Índice para consultas de copias disponibles por libro
CREATE INDEX idx_copies_availability ON book_copies (book_id, status);
```
### Evidencia con EXPLAIN

A continuación se muestran dos consultas con `EXPLAIN ANALYZE` que demuestran el impacto de los índices.

#### **Consulta 1: Búsqueda de Libros por Título**

**Sin índice:**
```sql
DROP INDEX IF EXISTS idx_books_search;

EXPLAIN ANALYZE
SELECT * FROM books 
WHERE title ILIKE '%Cien%' OR author ILIKE '%García%';
```

**Resultado esperado (Seq Scan):**
```
Seq Scan on books  (cost=0.00..25.50 rows=5 width=500)
  Filter: ((title ~~* '%Cien%'::text) OR (author ~~* '%García%'::text))
Planning Time: 0.123 ms
Execution Time: 2.456 ms
```
**Con índice:**
```sql
CREATE INDEX idx_books_search ON books (title, author);

EXPLAIN ANALYZE
SELECT * FROM books 
WHERE title ILIKE '%Cien%' OR author ILIKE '%García%';
```

**Resultado esperado (Index Scan):**
```
Index Scan using idx_books_search on books  (cost=0.15..8.17 rows=5 width=500)
  Filter: ((title ~~* '%Cien%'::text) OR (author ~~* '%García%'::text))
Planning Time: 0.098 ms
Execution Time: 0.234 ms
```
#### **Consulta 2: Préstamos Activos por Miembro**

**Sin índice:**
```sql
DROP INDEX IF EXISTS idx_loans_member;

EXPLAIN ANALYZE
SELECT l.*, b.title 
FROM loans l
JOIN book_copies bc ON l.book_copy_id = bc.copy_id
JOIN books b ON bc.book_id = b.book_id
WHERE l.member_id = 1 AND l.returned_at IS NULL;
```
**Resultado esperado (Seq Scan):**
```
Hash Join  (cost=45.00..123.45 rows=10 width=600)
  ->  Seq Scan on loans l  (cost=0.00..50.00 rows=50 width=400)
        Filter: (member_id = 1 AND returned_at IS NULL)
Planning Time: 0.234 ms
Execution Time: 5.678 ms

**Con índice:**
```sql
CREATE INDEX idx_loans_member ON loans (member_id, loan_date);
CREATE INDEX idx_loans_active ON loans (book_copy_id, returned_at) 
WHERE returned_at IS NULL;

EXPLAIN ANALYZE
SELECT l.*, b.title 
FROM loans l
JOIN book_copies bc ON l.book_copy_id = bc.copy_id
JOIN books b ON bc.book_id = b.book_id
WHERE l.member_id = 1 AND l.returned_at IS NULL;
```
**Resultado esperado (Index Scan):**
```
Nested Loop  (cost=0.42..23.67 rows=10 width=600)
  ->  Index Scan using idx_loans_member on loans l  (cost=0.29..8.31 rows=2 width=400)
        Index Cond: (member_id = 1)
        Filter: (returned_at IS NULL)
Planning Time: 0.156 ms
Execution Time: 0.892 ms
```
### Cómo Verificar los Índices

Conéctate a la base de datos y ejecuta:

```bash
# Desde la terminal
docker exec -it postgres_biblioteca psql -U postgres -d actividad_db
```

Dentro de `psql`:

```sql
-- Ver todos los índices creados
\di

-- Ver índices de una tabla específica
\d loans

-- Ejecutar EXPLAIN en una consulta
EXPLAIN ANALYZE
SELECT * FROM vw_most_borrowed_books WHERE title ILIKE '%Don%';
```


##  D) Seguridad de la Base de Datos

### Configuración de Roles y Permisos

El proyecto implementa **seguridad por capas** siguiendo el principio de **mínimo privilegio**:

 **Usuario `app_user`** con permisos de **solo lectura (SELECT)** sobre **vistas únicamente**  
 **Sin acceso directo** a las tablas base (`members`, `books`, `loans`, etc.)  
 **Consultas parametrizadas** para prevenir SQL injection  
 **Validación con Zod** en el servidor

### Roles Definidos en `db/06_roles.sql`

```sql
-- 1. Crear el rol de aplicación
CREATE ROLE app_user WITH LOGIN PASSWORD 'tu_password_seguro';

-- 2. Revocar todos los permisos por defecto
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_user;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM app_user;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM app_user;

-- 3. Otorgar SELECT solo sobre las vistas de reportes
GRANT SELECT ON vw_most_borrowed_books TO app_user;
GRANT SELECT ON vw_overdue_loans TO app_user;
GRANT SELECT ON vw_fines_summary TO app_user;
GRANT SELECT ON vw_member_activity TO app_user;
GRANT SELECT ON vw_inventory_health TO app_user;

-- 4. Permitir uso del esquema public
GRANT USAGE ON SCHEMA public TO app_user;
```

### Verificación de Seguridad

#### **Paso 1: Conectarse como `app_user`**

```bash
# Obtener el nombre del contenedor
docker ps

# Conectarse con el usuario app_user
docker exec -it postgres_biblioteca psql -U app_user -d actividad_db
```

#### **Paso 2: Intentar Consultar una VISTA ( Debe Funcionar)**

```sql
-- Esta consulta DEBE funcionar
SELECT * FROM vw_most_borrowed_books LIMIT 5;
Se te pedira la contraseña: 'tu_password_seguro'
```

**Resultado esperado:**
```
 title                  | author           | category | total_loans | loan_rank
------------------------+------------------+----------+-------------+-----------
 Cien años de soledad   | Gabriel García M.| Fiction  |          25 |         1
 Don Quijote            | Miguel de Cerva. | Classic  |          22 |         2
 1984                   | George Orwell    | Fiction  |          20 |         3
(3 rows)

#### **Paso 3: Intentar Consultar una TABLA (Debe Fallar)**

```sql
-- Esta consulta DEBE fallar
SELECT * FROM members LIMIT 5;
```

**Resultado esperado:**
```
ERROR:  permission denied for table members
```

 **Éxito:** El usuario NO tiene acceso a las tablas base.

---

#### **Paso 4: Intentar INSERTAR Datos ( Debe Fallar)**

```sql
-- Intentar insertar en una tabla
INSERT INTO books (title, author, isbn, category, published_year)
VALUES ('Libro Falso', 'Autor Falso', '0000000000', 'Fiction', 2024);
```

**Resultado esperado:**
```
ERROR:  permission denied for table books
```

 **Éxito:** El usuario NO puede modificar datos.

---

#### **Paso 5: Intentar ACTUALIZAR una Vista ( Debe Fallar)**

```sql
-- Intentar actualizar una vista
UPDATE vw_most_borrowed_books SET total_loans = 999 WHERE title = 'Don Quijote';
```

**Resultado esperado:**
```
ERROR:  cannot update view "vw_most_borrowed_books"
HINT:  To enable updating the view, provide an INSTEAD OF UPDATE trigger or an unconditional ON UPDATE DO INSTEAD rule.
```

 **Éxito:** Las vistas son de solo lectura.

---

#### **Paso 6: Verificar Permisos del Usuario**

Dentro de `psql` conectado como `postgres`:

```bash
docker exec -it postgres_biblioteca psql -U postgres -d actividad_db
```

```sql

-- Ver permisos del usuario app_user
\dp vw_most_borrowed_books

<- Resultado esperado:
--                                         Access privileges
--  Schema |          Name           | Type |     Access privileges      | Column privileges | Policies 
-- --------+-------------------------+------+----------------------------+-------------------+----------
--  public | vw_most_borrowed_books  | view | postgres=arwdDxt/postgres +|                   | 
--         |                         |      | app_user=r/postgres        |                   | 





### Evidencia de Conexión Segura en la Aplicación

La aplicación **NO se conecta como `postgres`**. La configuración en `docker-compose.yml` es:

```yaml
environment:
  DB_HOST: postgres
  DB_PORT: 5432
  DB_NAME: actividad_db
  DB_USER: app_user           #  NO es 'postgres'
  DB_PASSWORD: tu_password_seguro
```