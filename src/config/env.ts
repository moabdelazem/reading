import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

// Define schema for environment variables
const envSchema = z.object({
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("3000"),
  CORS_ORIGIN: z.string().default("*"),
  CORS_METHODS: z.string().default("GET, POST, PUT, DELETE, OPTIONS"),
  CORS_HEADERS: z.string().default("Content-Type, Authorization"),
  CORS_EXPOSE_HEADERS: z.string().default("Content-Type, Authorization"),
  JWT_SECRET: z.string().default("secret"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("5432"),
  DB_USER: z.string().default("reading"),
  DB_PASSWORD: z.string().default("reading"),
  DB_DATABASE: z.string().default("reading"),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Create config object
const envConfig = {
  port: env.PORT,
  cors: {
    origin: env.CORS_ORIGIN,
    methods: env.CORS_METHODS,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  db: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    createConnectionString: () => {
      return `postgresql://${envConfig.db.user}:${envConfig.db.password}@${envConfig.db.host}:${envConfig.db.port}/${envConfig.db.database}`;
    },
  },
};

export default envConfig;
