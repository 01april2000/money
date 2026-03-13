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
  const [bulkResult, setBulkResult] = React.useState<BulkResponse | null>(null)

  // Fetch santri data when dialog opens
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
      setSantri(data)
      setFilteredSantri(data)
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
            Bulk Tagihan Syahriah
          </DialogTitle>
          <DialogDescription>
            Buat tagihan syahriah untuk banyak santri sekaligus
          </DialogDescription>
        </DialogHeader>

        {!bulkResult ? (
          <div className="space-y-4">
            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bulan">Bulan *</Label>
                <Input
                  id="bulan"
                  value={bulan}
                  onChange={(e) => setBulan(e.target.value)}
                  placeholder="Contoh: Januari 2024"
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

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, NIS, atau kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                disabled={submitting}
              />
            </div>

            {/* Selection Summary */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedCount} santri dipilih
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSantri(new Set())}
                disabled={submitting || selectedCount === 0}
              >
                Hapus Pilihan
              </Button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
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
                      <TableHead>Status</TableHead>
                      <TableHead>Beasiswa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSantri.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
              >
                Batal
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
            </DialogFooter>
          </div>
        ) : (
          /* Result View */
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <div className="space-y-2">
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
              <div className="max-h-48 overflow-y-auto border rounded-lg">
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

            <DialogFooter>
              <Button type="button" onClick={handleClose}>
                Tutup
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
