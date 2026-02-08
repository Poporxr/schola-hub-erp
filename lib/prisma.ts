import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const rawConnectionString = process.env.DATABASE_URL;
const hasSslMode = rawConnectionString ? /[?&]sslmode=/i.test(rawConnectionString) : false;
const connectionString =
  rawConnectionString && !hasSslMode
    ? `${rawConnectionString}${rawConnectionString.includes("?") ? "&" : "?"}sslmode=verify-full`
    : rawConnectionString;

const adapter = new PrismaPg({
  connectionString,
})

export  const prisma = new PrismaClient({
  adapter,
});
