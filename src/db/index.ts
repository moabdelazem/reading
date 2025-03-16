// When using ES modules with pg, we need to import the default export first
import pg from "pg";
const { Pool } = pg;
import type { PoolClient } from "pg";
import envConfig from "../config/env.js";

// Create a connection pool
const pool = new Pool({
  host: envConfig.db.host,
  port: envConfig.db.port,
  user: envConfig.db.user,
  password: envConfig.db.password,
  database: envConfig.db.database,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
});

// Test the connection
pool
  .connect()
  .then((client: PoolClient) => {
    console.log("Connected to PostgreSQL database");
    client.release();
  })
  .catch((err: Error) => {
    console.error("Error connecting to PostgreSQL database:", err);
  });

// Export the pool for use in other modules
export default pool;
