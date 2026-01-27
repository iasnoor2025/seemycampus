import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Trophy, Rocket, Sparkles } from "lucide-react"
import SkillsList from "@/components/dashboard/SkillsList"
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader"

export const metadata: Metadata = {
    title: "Skills Management | Dashboard",
    description: "Global knowledge matrix and skill taxonomies management",
}

export default async function SkillsPage() {
    const session = await auth()

    if (!session) {
        redirect("/auth/signin")
    }

    const stats = [
        {
            title: "Active Skills",
            value: "154",
            label: "Across all domains",
            icon: Brain,
            gradient: "from-blue-600 to-indigo-700"
        },
        {
            title: "Certification Support",
            value: "82",
            label: "Verified Skills",
            icon: Trophy,
            gradient: "from-amber-500 to-orange-600"
        },
        {
            title: "Growth Trend",
            value: "+12%",
            label: "Domain expansion",
            icon: Rocket,
            gradient: "from-emerald-500 to-teal-600"
        },
        {
            title: "AI Analysis",
            value: "Ready",
            label: "System Maturity",
            icon: Sparkles,
            gradient: "from-purple-500 to-pink-600"
        }
    ]

    return (
        <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-1000">
            <DashboardPageHeader
                title="Skill Taxonomies"
                description="Architect and manage the global skill matrix defining student and career profiles."
                breadcrumbs={[{ label: "Skills" }]}
                icon={Brain}
            />

            {/* Stats Cluster */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card
                            key={index}
                            className="group relative overflow-hidden border-0 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_80px_rgba(0,0,0,0.06)] transition-all duration-700 hover:-translate-y-2 bg-white rounded-[2.5rem]"
                        >
                            <CardContent className="p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{stat.title}</h4>
                                    <div className="text-4xl font-black text-slate-800 tracking-tighter leading-none mb-3">
                                        {stat.value}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Skill Intelligence Hub */}
            <Card className="border-0 shadow-[0_30px_90px_rgba(0,0,0,0.03)] bg-white rounded-[3rem] overflow-hidden">
                <CardHeader className="p-12 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/20">
                    <div>
                        <CardTitle className="text-2xl font-black text-slate-800 uppercase tracking-tight">Intelligence Matrix</CardTitle>
                        <CardDescription className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">Inventory of Human Performance & Knowledge Nodes</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-10">
                    <SkillsList />
                </CardContent>
            </Card>
        </div>
    )
}
