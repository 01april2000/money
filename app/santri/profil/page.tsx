"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/santri/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Calendar, MapPin, School, Shield, CheckCircle, XCircle, Clock } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

interface SantriData {
  id: string
  nis: string
  nama: string
  kelas: string
  asrama: string
  wali: string
  status: string
  beasiswa: boolean
  jenisBeasiswa: string | null
  jenisSantri: string
  user: {
    email: string
    role: string
  }
}

export default function ProfilPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [santriData, setSantriData] = useState<SantriData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth")
    }
  }, [session, isPending, router])

  useEffect(() => {
    const fetchSantri = async () => {
      try {
        const santriId = (session?.user as any)?.santriId
        if (santriId) {
          const res = await fetch(`/api/santri`)
          if (!res.ok) {
            throw new Error(`Santri API returned ${res.status}: ${res.statusText}`)
          }
          const data = await res.json()
          const santri = data.find((s: any) => s.id === santriId)
          if (!santri) {
            setError("Data santri tidak ditemukan. Silakan hubungi administrator.")
          } else {
            setSantriData(santri)
            setError(null)
          }
        } else {
          setError("ID santri tidak ditemukan di sesi. Silakan login kembali.")
        }
      } catch (error) {
        console.error("Error fetching santri data:", error)
        setError("Gagal memuat data profil. Silakan coba lagi nanti.")
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchSantri()
    }
  }, [session])

  const getJenisSantriLabel = (jenis: string) => {
    switch (jenis) {
      case "SMK":
        return "SMK"
      case "SMP":
        return "SMP"
      case "PONDOK":
        return "Pondok"
      default:
        return jenis
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AKTIF":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600">
            <CheckCircle className="h-3 w-3" />
            Aktif
          </span>
        )
      case "NON_AKTIF":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600">
            <Clock className="h-3 w-3" />
            Non-Aktif
          </span>
        )
      case "LULUS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600">
            <CheckCircle className="h-3 w-3" />
            Lulus
          </span>
        )
      case "KELUAR":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600">
            <XCircle className="h-3 w-3" />
            Keluar
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-600">
            {status}
          </span>
        )
    }
  }

  if (isPending || loading) {
    return (
      <DashboardLayout activeItem="profil">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <DashboardLayout activeItem="profil">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <XCircle className="h-16 w-16 text-destructive" />
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Terjadi Kesalahan</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeItem="profil">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Profil Santri</h1>
          <p className="text-muted-foreground">
            Informasi data santri
          </p>
        </div>

        {santriData ? (
          <>
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h2 className="text-2xl font-bold">{santriData.nama}</h2>
                    <p className="text-muted-foreground">NIS: {santriData.nis}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      {getStatusBadge(santriData.status)}
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                        <School className="h-3 w-3" />
                        {getJenisSantriLabel(santriData.jenisSantri)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informasi Pribadi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                    <p className="font-semibold">{santriData.nama}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">NIS</p>
                    <p className="font-semibold">{santriData.nis}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {santriData.user?.email || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Wali</p>
                    <p className="font-semibold">{santriData.wali || "-"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    Informasi Akademik
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Kelas</p>
                    <p className="font-semibold">{santriData.kelas || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Asrama</p>
                    <p className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {santriData.asrama || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Jenis Santri</p>
                    <p className="font-semibold">{getJenisSantriLabel(santriData.jenisSantri)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div>{getStatusBadge(santriData.status)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Informasi Akun
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-semibold">{santriData.user?.role || "SANTRI"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email Terdaftar</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {santriData.user?.email || "-"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Beasiswa Info */}
            {santriData.beasiswa && (
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                    <CheckCircle className="h-5 w-5" />
                    Informasi Beasiswa
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-green-900 dark:text-green-100 space-y-2">
                  <p>Santri mendapatkan beasiswa</p>
                  {santriData.jenisBeasiswa && (
                    <p>Jenis Beasiswa: {santriData.jenisBeasiswa}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Data santri tidak ditemukan</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
