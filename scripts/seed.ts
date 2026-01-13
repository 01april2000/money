#!/usr/bin/env bun
import { prisma } from "../lib/prisma"
import { hashPassword } from "better-auth/crypto"

async function main() {
  console.log("🌱 Starting database seed...")

  // Clear existing data
  console.log("🗑️  Clearing existing data...")
  await prisma.transaksi.deleteMany()
  await prisma.santri.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Hash passwords
  const adminPassword = await hashPassword("admin123")
  const bendaharaPassword = await hashPassword("bendahara123")
  const santriPassword = await hashPassword("santri123")

  // Create Users
  console.log("👤 Creating users...")
  const users = await prisma.user.createMany({
    data: [
      {
        id: "admin-001",
        name: "Admin Utama",
        email: "admin@pondok.com",
        emailVerified: true,
        role: "ADMIN",
      },
      {
        id: "bendahara-smk-001",
        name: "Bendahara SMK",
        email: "bendahara.smk@pondok.com",
        emailVerified: true,
        role: "BENDAHARA_SMK",
      },
      {
        id: "bendahara-smp-001",
        name: "Bendahara SMP",
        email: "bendahara.smp@pondok.com",
        emailVerified: true,
        role: "BENDAHARA_SMP",
      },
      {
        id: "bendahara-pondok-001",
        name: "Bendahara Pondok",
        email: "bendahara.pondok@pondok.com",
        emailVerified: true,
        role: "BENDAHARA_PONDOK",
      },
      {
        id: "santri-001",
        name: "Ahmad Fauzi",
        email: "ahmad@pondok.com",
        emailVerified: true,
        role: "SANTRI",
        santriId: "santri-001",
      },
      {
        id: "santri-002",
        name: "Budi Santoso",
        email: "budi@pondok.com",
        emailVerified: true,
        role: "SANTRI",
        santriId: "santri-002",
      },
      {
        id: "santri-003",
        name: "Citra Dewi",
        email: "citra@pondok.com",
        emailVerified: true,
        role: "SANTRI",
        santriId: "santri-003",
      },
      {
        id: "santri-004",
        name: "Doni Pratama",
        email: "doni@pondok.com",
        emailVerified: true,
        role: "SANTRI",
        santriId: "santri-004",
      },
      {
        id: "santri-005",
        name: "Eka Putri",
        email: "eka@pondok.com",
        emailVerified: true,
        role: "SANTRI",
        santriId: "santri-005",
      },
    ],
  })
  console.log(`✅ Created ${users.count} users`)

  // Create Accounts for authentication
  console.log("🔐 Creating accounts...")
  const accounts = await prisma.account.createMany({
    data: [
      {
        id: "account-admin-001",
        accountId: "admin@pondok.com",
        providerId: "credential",
        userId: "admin-001",
        password: adminPassword,
      },
      {
        id: "account-bendahara-smk-001",
        accountId: "bendahara.smk@pondok.com",
        providerId: "credential",
        userId: "bendahara-smk-001",
        password: bendaharaPassword,
      },
      {
        id: "account-bendahara-smp-001",
        accountId: "bendahara.smp@pondok.com",
        providerId: "credential",
        userId: "bendahara-smp-001",
        password: bendaharaPassword,
      },
      {
        id: "account-bendahara-pondok-001",
        accountId: "bendahara.pondok@pondok.com",
        providerId: "credential",
        userId: "bendahara-pondok-001",
        password: bendaharaPassword,
      },
      {
        id: "account-santri-001",
        accountId: "ahmad@pondok.com",
        providerId: "credential",
        userId: "santri-001",
        password: santriPassword,
      },
      {
        id: "account-santri-002",
        accountId: "budi@pondok.com",
        providerId: "credential",
        userId: "santri-002",
        password: santriPassword,
      },
      {
        id: "account-santri-003",
        accountId: "citra@pondok.com",
        providerId: "credential",
        userId: "santri-003",
        password: santriPassword,
      },
      {
        id: "account-santri-004",
        accountId: "doni@pondok.com",
        providerId: "credential",
        userId: "santri-004",
        password: santriPassword,
      },
      {
        id: "account-santri-005",
        accountId: "eka@pondok.com",
        providerId: "credential",
        userId: "santri-005",
        password: santriPassword,
      },
    ],
  })
  console.log(`✅ Created ${accounts.count} accounts`)

  // Create Santri
  console.log("🎓 Creating santri...")
  const santri1 = await prisma.santri.create({
    data: {
      nis: "2024001",
      nama: "Ahmad Fauzi",
      kelas: "X-A",
      asrama: "Asrama A",
      wali: "Bpk. H. Fauzi",
      status: "AKTIF",
      user: {
        connect: { id: "santri-001" },
      },
    },
  })
  const santri2 = await prisma.santri.create({
    data: {
      nis: "2024002",
      nama: "Budi Santoso",
      kelas: "XI-B",
      asrama: "Asrama B",
      wali: "Bpk. Santoso",
      status: "AKTIF",
      user: {
        connect: { id: "santri-002" },
      },
    },
  })
  const santri3 = await prisma.santri.create({
    data: {
      nis: "2024003",
      nama: "Citra Dewi",
      kelas: "XII-A",
      asrama: "Asrama C",
      wali: "Ibu Dewi",
      status: "AKTIF",
      user: {
        connect: { id: "santri-003" },
      },
    },
  })
  const santri4 = await prisma.santri.create({
    data: {
      nis: "2024004",
      nama: "Doni Pratama",
      kelas: "X-B",
      asrama: "Asrama A",
      wali: "Bpk. Pratama",
      status: "AKTIF",
      user: {
        connect: { id: "santri-004" },
      },
    },
  })
  const santri5 = await prisma.santri.create({
    data: {
      nis: "2024005",
      nama: "Eka Putri",
      kelas: "XI-A",
      asrama: "Asrama B",
      wali: "Ibu Putri",
      status: "AKTIF",
      user: {
        connect: { id: "santri-005" },
      },
    },
  })
  console.log(`✅ Created 5 santri`)

  // Get santri IDs for transactions
  const santriMap = new Map([
    ["Ahmad Fauzi", santri1.id],
    ["Budi Santoso", santri2.id],
    ["Citra Dewi", santri3.id],
    ["Doni Pratama", santri4.id],
    ["Eka Putri", santri5.id],
  ])

  // Create Transactions
  console.log("💰 Creating transactions...")
  const now = new Date()
  const transactions = [
    // SPP Transactions
    {
      kode: "SPP001",
      santriId: santriMap.get("Ahmad Fauzi")!,
      jenis: "SPP" as const,
      bulan: "Januari 2026",
      jumlah: 500000,
      tanggalBayar: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: "LUNAS" as const,
    },
    {
      kode: "SPP002",
      santriId: santriMap.get("Budi Santoso")!,
      jenis: "SPP" as const,
      bulan: "Januari 2026",
      jumlah: 500000,
      tanggalBayar: null,
      status: "BELUM_BAYAR" as const,
    },
    {
      kode: "SPP003",
      santriId: santriMap.get("Eka Putri")!,
      jenis: "SPP" as const,
      bulan: "Januari 2026",
      jumlah: 500000,
      tanggalBayar: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: "LUNAS" as const,
    },
    // Syahriah Transactions
    {
      kode: "SYH001",
      santriId: santriMap.get("Ahmad Fauzi")!,
      jenis: "SYAHRIAH" as const,
      bulan: "Januari 2026",
      jumlah: 300000,
      tanggalBayar: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: "LUNAS" as const,
    },
    {
      kode: "SYH002",
      santriId: santriMap.get("Doni Pratama")!,
      jenis: "SYAHRIAH" as const,
      bulan: "Januari 2026",
      jumlah: 300000,
      tanggalBayar: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: "BELUM_BAYAR" as const,
    },
    // Uang Saku Transactions
    {
      kode: "US001",
      santriId: santriMap.get("Ahmad Fauzi")!,
      jenis: "UANG_SAKU" as const,
      jumlah: 200000,
      tanggalBayar: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: "LUNAS" as const,
    },
    {
      kode: "US002",
      santriId: santriMap.get("Budi Santoso")!,
      jenis: "UANG_SAKU" as const,
      jumlah: 150000,
      tanggalBayar: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      status: "PENDING" as const,
    },
    // Laundry Transactions
    {
      kode: "LD001",
      santriId: santriMap.get("Ahmad Fauzi")!,
      jenis: "LAUNDRY" as const,
      jenisLaundry: "Cuci + Setrika",
      jumlah: 50000,
      tanggalBayar: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: "LUNAS" as const,
    },
    {
      kode: "LD002",
      santriId: santriMap.get("Citra Dewi")!,
      jenis: "LAUNDRY" as const,
      jenisLaundry: "Cuci Kering",
      jumlah: 30000,
      tanggalBayar: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: "LUNAS" as const,
    },
    {
      kode: "LD003",
      santriId: santriMap.get("Doni Pratama")!,
      jenis: "LAUNDRY" as const,
      jenisLaundry: "Setrika Saja",
      jumlah: 25000,
      tanggalBayar: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: "PENDING" as const,
    },
  ]

  const trxData = await prisma.transaksi.createMany({
    data: transactions,
  })
  console.log(`✅ Created ${trxData.count} transactions`)

  console.log("🎉 Seed completed successfully!")
  console.log("\n📋 Default Credentials:")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("Admin:")
  console.log("  Email: admin@pondok.com")
  console.log("  Password: admin123")
  console.log("\nBendahara SMK:")
  console.log("  Email: bendahara.smk@pondok.com")
  console.log("  Password: bendahara123")
  console.log("\nBendahara SMP:")
  console.log("  Email: bendahara.smp@pondok.com")
  console.log("  Password: bendahara123")
  console.log("\nBendahara Pondok:")
  console.log("  Email: bendahara.pondok@pondok.com")
  console.log("  Password: bendahara123")
  console.log("\nSantri (5 accounts):")
  console.log("  Emails: ahmad@pondok.com, budi@pondok.com, citra@pondok.com, doni@pondok.com, eka@pondok.com")
  console.log("  Password: santri123")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
