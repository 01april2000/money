-- CreateEnum
CREATE TYPE "StatusUangSaku" AS ENUM ('DITAMBAH', 'DIAMBIL');

-- AlterTable
ALTER TABLE "transaksi" ADD COLUMN     "statusUangSaku" "StatusUangSaku";
