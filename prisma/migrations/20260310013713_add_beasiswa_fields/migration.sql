-- CreateEnum
CREATE TYPE "JenisBeasiswa" AS ENUM ('FULL', 'SYAHRIAH', 'SPP', 'UANG_SAKU');

-- AlterTable
ALTER TABLE "santri" ADD COLUMN     "beasiswa" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jenisBeasiswa" "JenisBeasiswa";

-- CreateIndex
CREATE INDEX "santri_beasiswa_idx" ON "santri"("beasiswa");
