"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { CheckCircle2, XCircle, AlertCircle, Loader2, Search, Layers } from "lucide-react"

interface Santri {
  id: string
  nama: string
  nis: string
  kelas: string
  asrama: string
  status: string
  beasiswa: boolean
  jenisBeasiswa: string | null
  jenisSantri: string
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
      nonSMK: number
      total: number
    }
  }
  results: BulkResult[]
}

interface BulkSyahriahDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function BulkSyahriahDialog({ open, onOpenChange, onSuccess }: BulkSyahriahDialogProps) {
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

  // Fetch SMK santri data when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchSantri()
    }
  }, [open])

  const fetchSantri = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/santri")
      if (!response.ok) throw new Error("Failed to fetch santri")
      const data = await response.json()
      // Filter only SMK santri
      const smkSantri = data.filter((s: Santri) => s.jenisSantri === "SMK")
      setSantri(smkSantri)
      setFilteredSantri(smkSantri)
    } catch (error) {
      toast.error("Gagal memuat data santri")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

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
      const response = await fetch("/api/bendahara-smk/syahriah/bulk", {
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

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }

      // Reset form
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

  // Handle close dialog
  const handleClose = () => {
    if (!submitting) {
      setSelectedSantri(new Set())
      setBulan("")
      setJumlah("")
      setKeterangan("")
      setPeriodePembayaran("")
      setTahun("")
      setBulkResult(null)
      setSearchQuery("")
      onOpenChange(false)
    }
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Bulk Tagihan Syahriah SMK
          </DialogTitle>
          <DialogDescription>
            Buat tagihan syahriah untuk banyak santri SMK sekaligus
          </DialogDescription>
        </DialogHeader>

        {!bulkResult ? (
          <div className="space-y-4">
            {/* Form */}
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
                placeholder="Keterangan tambahan"
                disabled={submitting}
              />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari santri SMK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={submitting}
              />
            </div>

            {/* Santri Selection */}
            <div className="border rounded-lg">
              <div className="flex items-center gap-2 p-3 border-b bg-muted/50">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  disabled={submitting}
                />
                <Label htmlFor="select-all" className="font-medium">
                  Pilih Semua ({filteredSantri.length} santri)
                </Label>
                <span className="ml-auto text-sm text-muted-foreground">
                  {selectedCount} dipilih
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredSantri.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Tidak ada santri SMK yang ditemukan
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>NIS</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Beasiswa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSantri.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedSantri.has(s.id)}
                              onCheckedChange={(checked) =>
                                handleSelectSantri(s.id, checked as boolean)
                              }
                              disabled={submitting}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{s.nama}</TableCell>
                          <TableCell className="font-mono text-xs">{s.nis}</TableCell>
                          <TableCell>{s.kelas}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                s.status
                              )}`}
                            >
                              {s.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {s.beasiswa ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                {s.jenisBeasiswa}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Hasil Bulk Tagihan Syahriah
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Berhasil Dibuat</div>
                <div className="text-2xl font-bold text-green-600">
                  {bulkResult.summary.created}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Dilewati</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {bulkResult.summary.skipped.total}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Beasiswa: {bulkResult.summary.skipped.beasiswa} | Non-Aktif:{" "}
                  {bulkResult.summary.skipped.nonAktif} | Sudah Ada:{" "}
                  {bulkResult.summary.skipped.existing}
                </div>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>NIS</TableHead>
                    <TableHead>Alasan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkResult.results.map((result) => (
                    <TableRow key={result.santriId}>
                      <TableCell>
                        {result.status === "created" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : result.status === "skipped" ? (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{result.nama}</TableCell>
                      <TableCell className="font-mono text-xs">{result.nis}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {result.reason || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <DialogFooter>
          {bulkResult ? (
            <Button onClick={handleClose} type="button">
              Tutup
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                type="button"
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                onClick={handleBulkCreate}
                type="button"
                disabled={submitting || selectedCount === 0}
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
