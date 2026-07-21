import { PrismaClient } from '../generated/client';
import 'dotenv/config';

export const prisma = new PrismaClient();