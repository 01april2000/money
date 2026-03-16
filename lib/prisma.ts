import { PrismaClient } from './generated/prisma';
import * as Enums from './generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const JenisTransaksi = Enums.JenisTransaksi;
export const Role = Enums.Role;
export const StatusTransaksi = Enums.StatusTransaksi;
export const StatusUangSaku = Enums.StatusUangSaku;
export const JenisBeasiswa = Enums.JenisBeasiswa;
export const JenisSantri = Enums.JenisSantri;
export const PeriodePembayaran = Enums.PeriodePembayaran;
export const StatusSantri = Enums.StatusSantri;

export type JenisTransaksi = Enums.JenisTransaksi;
export type Role = Enums.Role;
export type StatusTransaksi = Enums.StatusTransaksi;
export type StatusUangSaku = Enums.StatusUangSaku;
export type JenisBeasiswa = Enums.JenisBeasiswa;
export type JenisSantri = Enums.JenisSantri;
export type PeriodePembayaran = Enums.PeriodePembayaran;
export type StatusSantri = Enums.StatusSantri;
