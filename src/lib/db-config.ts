import "dotenv/config";

export function getDatabaseConfig() {
  const useSsl =
    process.env.DATABASE_SSL === "true" ||
    process.env.DATABASE_SSL === "1" ||
    process.env.NODE_ENV === "production";

  return {
    host: process.env.DATABASE_HOST ?? "localhost",
    port: Number(process.env.DATABASE_PORT ?? 3306),
    user: process.env.DATABASE_USER ?? "root",
    password: process.env.DATABASE_PASSWORD ?? "",
    database: process.env.DATABASE_NAME ?? "ressources_telecom",
    connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT ?? 10),
    allowPublicKeyRetrieval: true,
    // Requis pour MySQL cloud (TiDB, Aiven, etc.)
    ...(useSsl ? { ssl: { rejectUnauthorized: true } } : {}),
  };
}

export function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const config = getDatabaseConfig();
  const encodedPassword = encodeURIComponent(config.password);

  return `mysql://${config.user}:${encodedPassword}@${config.host}:${config.port}/${config.database}`;
}
