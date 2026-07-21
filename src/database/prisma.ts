import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import 'dotenv/config'
import ws from 'ws'
import { PrismaClient } from '../generated/client'

neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })

export const prisma = new PrismaClient({ adapter })