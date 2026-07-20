import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../generated/client';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || '';
const adapter = new PrismaNeon({ connectionString });

export const prisma = new PrismaClient({ adapter });