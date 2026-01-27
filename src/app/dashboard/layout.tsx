import { Sidebar } from "@/components/dashboard/Sidebar"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Search, Bell, Ghost, Sparkles, Command } from "lucide-react"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  // Check if user is admin
  const userRole = (session.user as any)?.role
  if (userRole !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar Header */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 w-96 group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest text-slate-600 placeholder:text-slate-400 w-full"
              />
              <div className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-md border border-slate-200 shadow-sm">
                <Command className="h-3 w-3 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400">K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">AI Agent Active</span>
            </div>

            <button className="relative p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all border border-slate-200">
              <Bell className="h-4 w-4" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
            </button>

            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-950/20 text-[10px] font-black uppercase tracking-widest"
            >
              <span>View Site</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

