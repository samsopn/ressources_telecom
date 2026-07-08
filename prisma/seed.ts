import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { getDatabaseConfig } from "../src/lib/db-config";

const adapter = new PrismaMariaDb(getDatabaseConfig());
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Routing", slug: "routing", icon: "route", color: "#3b82f6" },
  { name: "Switching", slug: "switching", icon: "network", color: "#8b5cf6" },
  { name: "Sécurité réseau", slug: "securite", icon: "shield", color: "#ef4444" },
  { name: "Télécom / 5G", slug: "telecom", icon: "radio", color: "#06b6d4" },
  { name: "Fibre optique", slug: "fibre", icon: "cable", color: "#f59e0b" },
  { name: "Protocoles", slug: "protocoles", icon: "layers", color: "#10b981" },
  { name: "Certifications", slug: "certifications", icon: "award", color: "#ec4899" },
  { name: "Labs & TP", slug: "labs", icon: "flask-conical", color: "#6366f1" },
  { name: "Documentation", slug: "documentation", icon: "book-open", color: "#64748b" },
  { name: "Outils", slug: "outils", icon: "wrench", color: "#84cc16" },
];

const tags = [
  "BGP",
  "OSPF",
  "MPLS",
  "VLAN",
  "STP",
  "QoS",
  "IPv6",
  "WiFi",
  "SD-WAN",
  "CCNA",
  "CCNP",
];

const collections = [
  {
    name: "Prépa CCNA",
    slug: "prepa-ccna",
    description: "Parcours de préparation certification CCNA",
    color: "#3b82f6",
    icon: "award",
  },
  {
    name: "Labs BGP/MPLS",
    slug: "labs-bgp-mpls",
    description: "Exercices pratiques routing avancé",
    color: "#8b5cf6",
    icon: "flask-conical",
  },
  {
    name: "Références RFC",
    slug: "references-rfc",
    description: "Normes et standards réseau",
    color: "#10b981",
    icon: "book-open",
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  for (const name of tags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const collection of collections) {
    await prisma.collection.upsert({
      where: { slug: collection.slug },
      update: collection,
      create: collection,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
