import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings as SettingsIcon, Loader2, Shield, Cpu, Database, Info } from "lucide-react"
import { FeatureFlagsManager } from "@/components/dashboard/FeatureFlagsManager"
import { OTPSettings } from "@/components/dashboard/OTPSettings"
import { ContactSettings } from "@/components/dashboard/ContactSettings"
import { AISettings, AIProviderConfig } from "@/components/dashboard/AISettings"
import { AITraining } from "@/components/dashboard/AITraining"
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader"

export const metadata: Metadata = {
  title: "Settings | Dashboard | SeeMyCampus",
  description: "Admin settings and configuration",
}

export default async function SettingsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="p-8 lg:p-12 space-y-12">
      <DashboardPageHeader
        title="Settings"
        description="Core platform configuration, security protocols, and feature orchestration."
        breadcrumbs={[{ label: "Settings" }]}
        icon={SettingsIcon}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "General", desc: "Site Identity", icon: Info, val: "Live" },
          { title: "Security", desc: "Access Control", icon: Shield, val: "Active" },
          { title: "Database", desc: "Data Registry", icon: Database, val: "Postgres" },
          { title: "Engine", desc: "Infrastructure", icon: Cpu, val: "v16.1" }
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-md bg-white rounded-[1.5rem] p-6 hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.title}</p>
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{s.val}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-12">
        {/* Core Sections */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-0.5 w-8 bg-blue-600 rounded-full" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Intelligence & AI</h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <Suspense fallback={<SettingsLoader />}><AISettings /></Suspense>
            <Suspense fallback={<SettingsLoader />}><AIProviderConfig /></Suspense>
            <Suspense fallback={<SettingsLoader />}><AITraining /></Suspense>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-0.5 w-8 bg-blue-600 rounded-full" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Feature Orchestration</h2>
          </div>
          <Suspense fallback={<SettingsLoader />}><FeatureFlagsManager /></Suspense>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-0.5 w-8 bg-blue-600 rounded-full" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Communication & Security</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<SettingsLoader />}><ContactSettings /></Suspense>
            <Suspense fallback={<SettingsLoader />}><OTPSettings /></Suspense>
          </div>
        </section>
      </div>
    </div>
  )
}

function SettingsLoader() {
  return (
    <Card className="border-0 shadow-sm bg-white/50 rounded-[2rem]">
      <CardContent className="p-12 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600/20" />
      </CardContent>
    </Card>
  )
}
