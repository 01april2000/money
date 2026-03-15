"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react"

interface GenerateResult {
  santriId: string
  nama: string
  nis: string
  status: string
  reason?: string
  transactionId?: string
}

interface GenerateResponse {
  success: boolean
  summary: {
    totalActiveSantri: number
    created: number
    skipped: {
      beasiswa: number
      existing: number
      total: number
    }
  }
  results: GenerateResult[]
}

interface GenerateMonthlySyahriahDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function GenerateMonthlySyahriahDialog({ open, onOpenChange, onSuccess }: GenerateMonthlySyahriahDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [bulan, setBulan] = React.useState("")
  const [jumlah, setJumlah] = React.useState("")
  const [keterangan, setKeterangan] = React.useState("")
  const [kelas, setKelas] = React.useState("")
  const [asrama, setAsrama] = React.useState("")
  const [skipExisting, setSkipExisting] = React.useState(true)
  const [includeBeasiswa, setIncludeBeasiswa] = React.useState(false)
  const [periodePembayaran, setPeriodePembayaran] = React.useState<"BULANAN" | "TAHUNAN" | "">("")
  const [tahun, setTahun] = React.useState("")
  const [generateResult, setGenerateResult] = React.useState<GenerateResponse | null>(null)

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setBulan("")
      setJumlah("")
      setKeterangan("")
      setKelas("")
      setAsrama("")
      setSkipExisting(true)
      setIncludeBeasiswa(false)
      setPeriodePembayaran("")
      setTahun("")
      setGenerateResult(null)
    }
  }, [open])

  // Handle generate monthly
  const handleGenerateMonthly = async () => {
    if (!bulan || !jumlah) {
      toast.error("Bulan dan jumlah wajib diisi")
      return
    }

    setSubmitting(true)
    setGenerateResult(null)

    try {
      const response = await fetch("/api/bendahara-smk/syahriah/generate-monthly", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bulan,
          jumlah: parseInt(jumlah),
          keterangan: keterangan || undefined,
          kelas: kelas || undefined,
          asrama: asrama || undefined,
          skipExisting,
          includeBeasiswa,
          periodePembayaran: periodePembayaran || undefined,
          tahun: tahun ? parseInt(tahun) : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate monthly syahriah")
      }

      const result: GenerateResponse = await response.json()
      setGenerateResult(result)

      if (result.summary.created > 0) {
        toast.success(
          `Berhasil membuat ${result.summary.created} tagihan syahriah`
        )
      }

      if (result.summary.skipped.total > 0) {
        toast.info(
          `${result.summary.skipped.total} santri dilewati (beasiswa: ${result.summary.skipped.beasiswa}, sudah ada: ${result.summary.skipped.existing})`
        )
      }

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
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
      onOpenChange(false)
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate Bulanan Syahriah SMK
          </DialogTitle>
          <DialogDescription>
            Buat tagihan syahriah otomatis untuk semua santri SMK aktif
          </DialogDescription>
        </DialogHeader>

        {!generateResult ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kelas">Filter Kelas (Opsional)</Label>
                <Input
                  id="kelas"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  placeholder="Contoh: X-1, XI-2, XII-3"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asrama">Filter Asrama (Opsional)</Label>
                <Input
                  id="asrama"
                  value={asrama}
                  onChange={(e) => setAsrama(e.target.value)}
                  placeholder="Contoh: Asrama Putra 1"
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

            {/* Options */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skip-existing"
                  checked={skipExisting}
                  onCheckedChange={(checked) => setSkipExisting(checked as boolean)}
                  disabled={submitting}
                />
                <Label htmlFor="skip-existing" className="cursor-pointer">
                  Lewati santri yang sudah memiliki tagihan untuk bulan ini
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-beasiswa"
                  checked={includeBeasiswa}
                  onCheckedChange={(checked) => setIncludeBeasiswa(checked as boolean)}
                  disabled={submitting}
                />
                <Label htmlFor="include-beasiswa" className="cursor-pointer">
                  Sertakan santri penerima beasiswa (SYAHRIAH/FULL)
                </Label>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Info:</strong> Tagihan akan dibuat untuk semua santri SMK yang aktif. Santri non-aktif akan otomatis dilewati.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Hasil Generate Bulanan Syahriah
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Total Santri Aktif</div>
                <div className="text-2xl font-bold">
                  {generateResult.summary.totalActiveSantri}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Berhasil Dibuat</div>
                <div className="text-2xl font-bold text-green-600">
                  {generateResult.summary.created}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Dilewati</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {generateResult.summary.skipped.total}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Beasiswa: {generateResult.summary.skipped.beasiswa} | Sudah Ada:{" "}
                  {generateResult.summary.skipped.existing}
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
                  {generateResult.results.map((result) => (
                    <TableRow key={result.santriId}>
                      <TableCell>
                        {result.status === "created" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : result.status === "skipped" ? (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
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
          {generateResult ? (
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
                onClick={handleGenerateMonthly}
                type="button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Tagihan
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
