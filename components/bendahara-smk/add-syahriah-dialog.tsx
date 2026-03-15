"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

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

interface AddSyahriahDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddSyahriahDialog({ open, onOpenChange, onSuccess }: AddSyahriahDialogProps) {
  const [santri, setSantri] = React.useState<Santri[]>([])
  const [loading, setLoading] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [selectedSantriId, setSelectedSantriId] = React.useState("")
  const [bulan, setBulan] = React.useState("")
  const [jumlah, setJumlah] = React.useState("")
  const [keterangan, setKeterangan] = React.useState("")
  const [periodePembayaran, setPeriodePembayaran] = React.useState<"BULANAN" | "TAHUNAN" | "">("")
  const [tahun, setTahun] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")

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
    } catch (error) {
      toast.error("Gagal memuat data santri")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Filter santri based on search query
  const filteredSantri = React.useMemo(() => {
    if (!searchQuery) {
      return santri
    }

    const query = searchQuery.toLowerCase()
    return santri.filter(
      (s) =>
        s.nama.toLowerCase().includes(query) ||
        s.nis.toLowerCase().includes(query) ||
        s.kelas.toLowerCase().includes(query)
    )
  }, [searchQuery, santri])

  const selectedSantri = santri.find((s) => s.id === selectedSantriId)

  // Handle create transaction
  const handleCreate = async () => {
    if (!selectedSantriId) {
      toast.error("Pilih santri terlebih dahulu")
      return
    }

    if (!bulan || !jumlah) {
      toast.error("Bulan dan jumlah wajib diisi")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/bendahara-smk/syahriah", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          santriId: selectedSantriId,
          bulan,
          jumlah: parseInt(jumlah),
          keterangan: keterangan || undefined,
          periodePembayaran: periodePembayaran || undefined,
          tahun: tahun ? parseInt(tahun) : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create syahriah transaction")
      }

      toast.success("Tagihan Syahriah berhasil dibuat")

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }

      // Reset form and close dialog
      setSelectedSantriId("")
      setBulan("")
      setJumlah("")
      setKeterangan("")
      setPeriodePembayaran("")
      setTahun("")
      setSearchQuery("")
      onOpenChange(false)
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
      setSelectedSantriId("")
      setBulan("")
      setJumlah("")
      setKeterangan("")
      setPeriodePembayaran("")
      setTahun("")
      setSearchQuery("")
      onOpenChange(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: string) => {
    if (!amount) return ""
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseInt(amount))
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tambah Tagihan Syahriah SMK
          </DialogTitle>
          <DialogDescription>
            Buat tagihan Syahriah baru untuk santri SMK
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Santri Selection */}
          <div className="space-y-2">
            <Label htmlFor="santri-search">Cari Santri SMK *</Label>
            <Input
              id="santri-search"
              placeholder="Cari berdasarkan nama, NIS, atau kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={submitting}
            />
            {loading ? (
              <div className="flex items-center justify-center p-4 border rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                {filteredSantri.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Tidak ada santri SMK yang ditemukan
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredSantri.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSantriId(s.id)}
                        disabled={submitting}
                        className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                          selectedSantriId === s.id ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{s.nama}</div>
                            <div className="text-sm text-muted-foreground">
                              NIS: {s.nis} | Kelas: {s.kelas} | Asrama: {s.asrama}
                            </div>
                          </div>
                          {s.beasiswa && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                              {s.jenisBeasiswa}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Santri Info */}
          {selectedSantri && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm">
                <strong>Santri Terpilih:</strong> {selectedSantri.nama} ({selectedSantri.nis})
              </p>
              {selectedSantri.beasiswa && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  ⚠️ Santri ini memiliki beasiswa {selectedSantri.jenisBeasiswa}
                </p>
              )}
            </div>
          )}

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
              {jumlah && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(jumlah)}
                </p>
              )}
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            type="button"
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            onClick={handleCreate}
            type="button"
            disabled={submitting || !selectedSantriId}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Buat Tagihan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
