-- CreateEnum
CREATE TYPE "PeriodePembayaran" AS ENUM ('BULANAN', 'TAHUNAN');

-- AlterTable
ALTER TABLE "transaksi" ADD COLUMN     "periodePembayaran" "PeriodePembayaran",
ADD COLUMN     "tahun" INTEGER;

-- CreateIndex
CREATE INDEX "transaksi_periodePembayaran_idx" ON "transaksi"("periodePembayaran");

-- CreateIndex
CREATE INDEX "transaksi_tahun_idx" ON "transaksi"("tahun");
