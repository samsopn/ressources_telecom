import "dotenv/config";

export function getDatabaseConfig() {
  return {
    host: process.env.DATABASE_HOST ?? "localhost",
    port: Number(process.env.DATABASE_PORT ?? 3306),
    user: process.env.DATABASE_USER ?? "root",
    password: process.env.DATABASE_PASSWORD ?? "root",
    database: process.env.DATABASE_NAME ?? "ressources_telecom",
    connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT ?? 10),
    allowPublicKeyRetrieval: true,
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
