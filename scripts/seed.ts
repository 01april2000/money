import { prisma } from "../lib/prisma"

async function main() {
  console.log("🌱 Starting database seed...")

  // Clear existing data
  console.log("🗑️  Clearing existing data...")
  await prisma.transaksi.deleteMany()
  await prisma.santri.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

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
      },
      {
        id: "santri-002",
        name: "Budi Santoso",
        email: "budi@pondok.com",
        emailVerified: true,
        role: "SANTRI",
      },
      {
        id: "santri-003",
        name: "Citra Dewi",
        email: "citra@pondok.com",
        emailVerified: true,
        role: "SANTRI",
      },
      {
        id: "santri-004",
        name: "Doni Pratama",
        email: "doni@pondok.com",
        emailVerified: true,
        role: "SANTRI",
      },
      {
        id: "santri-005",
        name: "Eka Putri",
        email: "eka@pondok.com",
        emailVerified: true,
        role: "SANTRI",
      },
    ],
  })
  console.log(`✅ Created ${users.count} users`)

  // Create Santri
  console.log("🎓 Creating santri...")
  const santriData = await prisma.santri.createMany({
    data: [
      {
        nis: "2024001",
        nama: "Ahmad Fauzi",
        kelas: "X-A",
        asrama: "Asrama A",
        wali: "Bpk. H. Fauzi",
        status: "AKTIF",
        userId: "santri-001",
      },
      {
        nis: "2024002",
        nama: "Budi Santoso",
        kelas: "XI-B",
        asrama: "Asrama B",
        wali: "Bpk. Santoso",
        status: "AKTIF",
        userId: "santri-002",
      },
      {
        nis: "2024003",
        nama: "Citra Dewi",
        kelas: "XII-A",
        asrama: "Asrama C",
        wali: "Ibu Dewi",
        status: "AKTIF",
        userId: "santri-003",
      },
      {
        nis: "2024004",
        nama: "Doni Pratama",
        kelas: "X-B",
        asrama: "Asrama A",
        wali: "Bpk. Pratama",
        status: "AKTIF",
        userId: "santri-004",
      },
      {
        nis: "2024005",
        nama: "Eka Putri",
        kelas: "XI-A",
        asrama: "Asrama B",
        wali: "Ibu Putri",
        status: "AKTIF",
        userId: "santri-005",
      },
    ],
  })
  console.log(`✅ Created ${santriData.count} santri`)

  // Get santri IDs for transactions
  const santri = await prisma.santri.findMany({
    select: { id: true, nama: true },
  })

  const santriMap = new Map(santri.map(s => [s.nama, s.id]))

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
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
