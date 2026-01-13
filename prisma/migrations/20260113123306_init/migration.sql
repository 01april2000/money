-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BENDAHARA_SMK', 'BENDAHARA_SMP', 'BENDAHARA_PONDOK', 'SANTRI');

-- CreateEnum
CREATE TYPE "JenisTransaksi" AS ENUM ('SPP', 'SYAHRIAH', 'UANG_SAKU', 'LAUNDRY');

-- CreateEnum
CREATE TYPE "StatusTransaksi" AS ENUM ('LUNAS', 'PENDING', 'BELUM_BAYAR', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusSantri" AS ENUM ('AKTIF', 'NON_AKTIF', 'LULUS', 'KELUAR');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'SANTRI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "santriId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "santri" (
    "id" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "asrama" TEXT NOT NULL,
    "wali" TEXT NOT NULL,
    "status" "StatusSantri" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "santri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "jenis" "JenisTransaksi" NOT NULL,
    "bulan" TEXT,
    "jumlah" INTEGER NOT NULL,
    "tanggalBayar" TIMESTAMP(3),
    "status" "StatusTransaksi" NOT NULL DEFAULT 'BELUM_BAYAR',
    "jenisLaundry" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_santriId_key" ON "user"("santriId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "santri_nis_key" ON "santri"("nis");

-- CreateIndex
CREATE INDEX "santri_kelas_idx" ON "santri"("kelas");

-- CreateIndex
CREATE INDEX "santri_asrama_idx" ON "santri"("asrama");

-- CreateIndex
CREATE INDEX "santri_status_idx" ON "santri"("status");

-- CreateIndex
CREATE UNIQUE INDEX "transaksi_kode_key" ON "transaksi"("kode");

-- CreateIndex
CREATE INDEX "transaksi_santriId_idx" ON "transaksi"("santriId");

-- CreateIndex
CREATE INDEX "transaksi_jenis_idx" ON "transaksi"("jenis");

-- CreateIndex
CREATE INDEX "transaksi_status_idx" ON "transaksi"("status");

-- CreateIndex
CREATE INDEX "transaksi_createdAt_idx" ON "transaksi"("createdAt");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "santri" ADD CONSTRAINT "santri_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("santriId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "santri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
