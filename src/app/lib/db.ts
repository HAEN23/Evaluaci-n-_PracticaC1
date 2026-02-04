import { Pool } from 'pg';

// Es crucial que estas variables de entorno estén definidas en tu entorno de ejecución (ej. .env.local o en Docker)
// NUNCA las escribas directamente en el código.
const pool = new Pool({
  user: process.env.DB_USER, // app_user
  host: process.env.DB_HOST, // 'db' en Docker Compose
  database: process.env.DB_NAME, // postgres
  password: process.env.DB_PASSWORD, // tu_password_seguro
  port: parseInt(process.env.DB_PORT || "5432"),
});

export default pool;