// backend/prisma/db.js
import pkg from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const { PrismaClient } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

let dbPath;

if (isDev) {
  // Force it to point to backend/prisma/database.db
  dbPath = path.resolve(__dirname, 'database.db');
} else {
  // Production AppData logic
  const userDataPath = path.join(process.env.APPDATA, 'shop-management-system');
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  dbPath = path.join(userDataPath, 'database.db');
}

console.log("Connect to DB at:", dbPath); // Add this to debug where it's looking

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

export default prisma;