import "dotenv/config";
import { defineConfig } from "prisma/config";

function getMigrateDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is missing. Set it in Vercel Environment Variables.");
  }

  // TiDB Cloud (public endpoint) requires TLS for Prisma Migrate.
  if (url.includes("sslaccept=")) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}sslaccept=strict`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: getMigrateDatabaseUrl(),
  },
});
