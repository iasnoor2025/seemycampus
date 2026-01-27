import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, MapPin, Navigation, Compass, Layers } from "lucide-react"
import RegionsList from "@/components/dashboard/RegionsList"
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader"

export const metadata: Metadata = {
    title: "Territory Management | Dashboard",
    description: "Geographic hierarchy and regional configuration",
}

export default async function RegionsPage() {
    const session = await auth()

    if (!session) {
        redirect("/auth/signin")
    }

    const stats = [
        {
            title: "Active Jurisdictions",
            value: "2,481",
            label: "Global Reach",
            icon: Globe,
            gradient: "from-indigo-600 to-blue-700"
        },
        {
            title: "Strategic Points",
            value: "142",
            label: "Priority Hubs",
            icon: Navigation,
            gradient: "from-emerald-500 to-teal-600"
        },
        {
            title: "Hierarchy Depth",
            value: "4 Levels",
            label: "State > City > Area",
            icon: Layers,
            gradient: "from-amber-500 to-orange-600"
        },
        {
            title: "Global Alignment",
            value: "99.2%",
            label: "Map Accuracy",
            icon: Compass,
            gradient: "from-purple-500 to-pink-600"
        }
    ]

    return (
        <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-1000">
            <DashboardPageHeader
                title="Territory Matrix"
                description="Configure geographic hierarchies, regional boundaries, and operational hubs."
                breadcrumbs={[{ label: "Regions" }]}
                icon={Globe}
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
                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-2xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500`}>
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

            {/* Territory Hub */}
            <Card className="border-0 shadow-[0_30px_90px_rgba(0,0,0,0.03)] bg-white rounded-[3rem] overflow-hidden">
                <CardHeader className="p-12 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/20">
                    <div>
                        <CardTitle className="text-2xl font-black text-slate-800 uppercase tracking-tight">Geospatial Inventory</CardTitle>
                        <CardDescription className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">Managing the Global Topography of Educational Operations</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-10">
                    <RegionsList />
                </CardContent>
            </Card>
        </div>
    )
}
