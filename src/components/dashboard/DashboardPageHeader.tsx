
import { ChevronRight, LucideIcon } from "lucide-react"
import Link from "next/link"

interface Breadcrumb {
    label: string
    href?: string
}

interface DashboardPageHeaderProps {
    title: string
    description?: string
    breadcrumbs?: Breadcrumb[]
    action?: React.ReactNode
    icon?: LucideIcon
}

export function DashboardPageHeader({
    title,
    description,
    breadcrumbs,
    action,
    icon: Icon
}: DashboardPageHeaderProps) {
    return (
        <div className="mb-10">
            {/* Breadcrumbs */}
            {breadcrumbs && (
                <nav className="flex items-center gap-2 mb-4">
                    <Link
                        href="/dashboard"
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors"
                    >
                        Dashboard
                    </Link>
                    {breadcrumbs.map((crumb, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <ChevronRight className="h-3 w-3 text-slate-300" />
                            {crumb.href ? (
                                <Link
                                    href={crumb.href}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                                    {crumb.label}
                                </span>
                            )}
                        </div>
                    ))}
                </nav>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-1 w-12 bg-blue-600 rounded-full" />
                        {Icon && <Icon className="h-4 w-4 text-blue-600" />}
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Module</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] max-w-2xl">
                            {description}
                        </p>
                    )}
                </div>

                {action && (
                    <div className="shrink-0 flex items-center gap-3">
                        {action}
                    </div>
                )}
            </div>
        </div>
    )
}
