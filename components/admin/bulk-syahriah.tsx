"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw, Search } from "lucide-react"

interface Santri {
  id: string
  nama: string
  nis: string
  kelas: string
  asrama: string
  status: string
  beasiswa: boolean
  jenisBeasiswa: string | null
}

interface BulkResult {
  santriId: string
  nama: string
  nis: string
  status: string
  reason?: string
  transactionId?: string
}

interface BulkResponse {
  success: boolean
  summary: {
    totalRequested: number
    created: number
    skipped: {
      beasiswa: number
      nonAktif: number
      existing: number
      total: number
    }
  }
  results: BulkResult[]
}

export function BulkSyahriah() {
  const [santri, setSantri] = React.useState<Santri[]>([])
  const [filteredSantri, setFilteredSantri] = React.useState<Santri[]>([])
  const [selectedSantri, setSelectedSantri] = React.useState<Set<string>>(new Set())
  const [loading, setLoading] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [bulan, setBulan] = React.useState("")
  const [jumlah, setJumlah] = React.useState("")
  const [keterangan, setKeterangan] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [periodePembayaran, setPeriodePembayaran] = React.useState<"BULANAN" | "TAHUNAN" | "">("")
  const [tahun, setTahun] = React.useState("")
  const [bulkResult, setBulkResult] = React.useState<BulkResponse | null>(null)

  // Fetch santri data
  const fetchSantri = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/santri")
      if (!response.ok) throw new Error("Failed to fetch santri")
      const data = await response.json()
      setSantri(data)
      setFilteredSantri(data)
    } catch (error) {
      toast.error("Gagal memuat data santri")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSantri()
  }, [fetchSantri])

  // Filter santri based on search query
  React.useEffect(() => {
    if (!searchQuery) {
      setFilteredSantri(santri)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = santri.filter(
      (s) =>
        s.nama.toLowerCase().includes(query) ||
        s.nis.toLowerCase().includes(query) ||
        s.kelas.toLowerCase().includes(query)
    )
    setFilteredSantri(filtered)
  }, [searchQuery, santri])

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSantri(new Set(filteredSantri.map((s) => s.id)))
    } else {
      setSelectedSantri(new Set())
    }
  }

  // Handle individual selection
  const handleSelectSantri = (santriId: string, checked: boolean) => {
    setSelectedSantri((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(santriId)
      } else {
        newSet.delete(santriId)
      }
      return newSet
    })
  }

  // Check if all filtered santri are selected
  const allSelected =
    filteredSantri.length > 0 &&
    filteredSantri.every((s) => selectedSantri.has(s.id))

  // Check if some filtered santri are selected
  const someSelected =
    filteredSantri.some((s) => selectedSantri.has(s.id)) && !allSelected

  // Get count of selected santri
  const selectedCount = selectedSantri.size

  // Handle bulk create
  const handleBulkCreate = async () => {
    if (selectedCount === 0) {
      toast.error("Pilih minimal satu santri")
      return
    }

    if (!bulan || !jumlah) {
      toast.error("Bulan dan jumlah wajib diisi")
      return
    }

    setSubmitting(true)
    setBulkResult(null)

    try {
      const response = await fetch("/api/syahriah/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          santriIds: Array.from(selectedSantri),
          bulan,
          jumlah: parseInt(jumlah),
          keterangan: keterangan || undefined,
          periodePembayaran: periodePembayaran || undefined,
          tahun: tahun ? parseInt(tahun) : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create bulk syahriah")
      }

      const result: BulkResponse = await response.json()
      setBulkResult(result)

      if (result.summary.created > 0) {
        toast.success(
          `Berhasil membuat ${result.summary.created} tagihan syahriah`
        )
      }

      if (result.summary.skipped.total > 0) {
        toast.info(
          `${result.summary.skipped.total} santri dilewati (beasiswa: ${result.summary.skipped.beasiswa}, non-aktif: ${result.summary.skipped.nonAktif}, sudah ada: ${result.summary.skipped.existing})`
        )
      }

      // Clear form
      setSelectedSantri(new Set())
      setBulan("")
      setJumlah("")
      setKeterangan("")
      setPeriodePembayaran("")
      setTahun("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat tagihan")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "AKTIF":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "NON_AKTIF":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
      case "LULUS":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "KELUAR":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Bulk Tagihan Syahriah</h2>
        <p className="text-muted-foreground">
          Buat tagihan syahriah untuk banyak santri sekaligus
        </p>
      </div>

      {/* Bulk Form */}
      <Card>
        <CardHeader>
          <CardTitle>Formulir Bulk Tagihan</CardTitle>
          <CardDescription>
            Isi detail tagihan dan pilih santri yang akan ditagih
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bulan">Bulan/Periode *</Label>
              <Input
                id="bulan"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                placeholder="Contoh: Januari atau Tahunan"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jumlah">Jumlah (IDR) *</Label>
              <Input
                id="jumlah"
                type="number"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                placeholder="Contoh: 500000"
                disabled={submitting}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodePembayaran">Periode Pembayaran</Label>
              <select
                id="periodePembayaran"
                value={periodePembayaran}
                onChange={(e) => setPeriodePembayaran(e.target.value as "BULANAN" | "TAHUNAN" | "")}
                disabled={submitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">- Pilih Periode -</option>
                <option value="BULANAN">Bulanan</option>
                <option value="TAHUNAN">Tahunan</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tahun">Tahun</Label>
              <Input
                id="tahun"
                type="number"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                placeholder="Contoh: 2024"
                disabled={submitting}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
            <Input
              id="keterangan"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Syahriah bulan ini"
              disabled={submitting}
            />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedCount} santri dipilih
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedSantri(new Set())}
                disabled={submitting || selectedCount === 0}
              >
                Hapus Pilihan
              </Button>
              <Button
                type="button"
                onClick={handleBulkCreate}
                disabled={submitting || selectedCount === 0 || !bulan || !jumlah}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  `Buat Tagihan (${selectedCount})`
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Result */}
      {bulkResult && (
        <Card>
          <CardHeader>
            <CardTitle>Hasil Bulk Tagihan</CardTitle>
            <CardDescription>
              Ringkasan hasil pembuatan tagihan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {bulkResult.summary.created}
                </div>
                <div className="text-sm text-green-600/70 dark:text-green-400/70">
                  Berhasil Dibuat
                </div>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {bulkResult.summary.skipped.total}
                </div>
                <div className="text-sm text-yellow-600/70 dark:text-yellow-400/70">
                  Dilewati
                </div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {bulkResult.summary.totalRequested}
                </div>
                <div className="text-sm text-blue-600/70 dark:text-blue-400/70">
                  Total Diminta
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {Math.round(
                    (bulkResult.summary.created / bulkResult.summary.totalRequested) * 100
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600/70 dark:text-gray-400/70">
                  Tingkat Keberhasilan
                </div>
              </div>
            </div>

            {bulkResult.summary.skipped.total > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="font-medium">Detail Dilewati:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="h-4 w-4" />
                    Beasiswa: {bulkResult.summary.skipped.beasiswa}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <XCircle className="h-4 w-4" />
                    Non-Aktif: {bulkResult.summary.skipped.nonAktif}
                  </div>
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <AlertCircle className="h-4 w-4" />
                    Sudah Ada: {bulkResult.summary.skipped.existing}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium">Detail Per Santri:</h4>
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>NIS</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Alasan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulkResult.results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{result.nama}</TableCell>
                        <TableCell>{result.nis}</TableCell>
                        <TableCell>
                          {result.status === "created" ? (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-4 w-4" />
                              Berhasil
                            </span>
                          ) : result.status === "skipped" ? (
                            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                              <AlertCircle className="h-4 w-4" />
                              Dilewati
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                              <XCircle className="h-4 w-4" />
                              Gagal
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {result.reason || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Santri Selection Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Santri</CardTitle>
              <CardDescription>
                Pilih santri yang akan diberi tagihan syahriah
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSantri}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, NIS, atau kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Asrama</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Beasiswa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSantri.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchQuery
                          ? "Tidak ada santri yang cocok dengan pencarian"
                          : "Tidak ada data santri"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSantri.map((s) => (
                      <TableRow
                        key={s.id}
                        className={
                          selectedSantri.has(s.id)
                            ? "bg-primary/5 dark:bg-primary/10"
                            : ""
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedSantri.has(s.id)}
                            onCheckedChange={(checked) =>
                              handleSelectSantri(s.id, checked as boolean)
                            }
                            aria-label={`Select ${s.nama}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{s.nis}</TableCell>
                        <TableCell>{s.nama}</TableCell>
                        <TableCell>{s.kelas}</TableCell>
                        <TableCell>{s.asrama}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              s.status
                            )}`}
                          >
                            {s.status.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell>
                          {s.beasiswa ? (
                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                              {s.jenisBeasiswa || "Ya"}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Tidak</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Selection Summary */}
          {filteredSantri.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Menampilkan {filteredSantri.length} dari {santri.length} santri
              {selectedCount > 0 && ` • ${selectedCount} dipilih`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
