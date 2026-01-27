import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LeadsList } from "@/components/dashboard/LeadsList"
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader"
import { FileText, Users, Clock, Target } from "lucide-react"

export const metadata: Metadata = {
  title: "Leads | Dashboard | SeeMyCampus",
  description: "Manage leads in the admin dashboard",
}

export default async function LeadsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  const userRole = (session.user as any)?.role || "student"
  const isCounselor = userRole === "counselor"

  return (
    <div className="p-8 lg:p-12 space-y-12">
      <DashboardPageHeader
        title={isCounselor ? "My Leads" : "Leads Registry"}
        description={isCounselor
          ? "High-priority student assignments requiring immediate counsel and guidance."
          : "Central processing hub for student inquiries, quiz results, and admission interests."
        }
        breadcrumbs={[{ label: "Leads" }]}
        icon={FileText}
      />

      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden border border-slate-100">
        <div className="p-10 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Active Pipeline</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Lead Ingestion & Conversion Tracking</p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <LeadsList />
        </div>
      </div>
    </div>
  )
}
