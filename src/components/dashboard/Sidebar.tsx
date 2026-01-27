"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  Image as ImageIcon,
  MessageSquare,
  Award,
  Calendar,
  BookOpen,
  Heart,
  UserCheck,
  Shield,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  UserCog,
  QrCode
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { USER_ROLES } from "@/lib/roles"

const allMenuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "moderator", "staff", "counselor"],
    featureKey: null, // Dashboard is always available
  },
  {
    title: "Leads",
    href: "/dashboard/leads",
    icon: FileText,
    roles: ["admin", "moderator", "staff", "counselor"],
    featureKey: "dashboard_leads",
  },
  {
    title: "Employees",
    href: "/dashboard/employees",
    icon: UserCog,
    roles: ["admin"],
    featureKey: null, // Employees is always available for admins
  },
  {
    title: "Attendance QR Code",
    href: "/dashboard/attendance-qr",
    icon: QrCode,
    roles: ["admin"],
    featureKey: null, // Attendance QR is always available for admins
  },
  {
    title: "Attendance Records",
    href: "/dashboard/attendance",
    icon: Calendar,
    roles: ["admin"],
    featureKey: null, // Attendance Records is always available for admins
  },
  {
    title: "Colleges",
    href: "/dashboard/colleges",
    icon: Building2,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_colleges",
  },
  {
    title: "AI Enrichment",
    href: "/dashboard/enrichment",
    icon: Sparkles,
    roles: ["admin"],
    featureKey: null, // AI Enrichment is always available for admins
  },
  {
    title: "Enrichment Results",
    href: "/dashboard/enrichment/results",
    icon: CheckCircle2,
    roles: ["admin"],
    featureKey: null, // Enrichment Results is always available for admins
  },

  {
    title: "Placements",
    href: "/dashboard/placements",
    icon: BarChart3,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_placements",
  },
  {
    title: "Application Guides",
    href: "/dashboard/application-guides",
    icon: FileText,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_application_guides",
  },
  {
    title: "Inquiries",
    href: "/dashboard/inquiries",
    icon: MessageSquare,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_inquiries",
  },
  {
    title: "News",
    href: "/dashboard/news",
    icon: BookOpen,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_news",
  },
  {
    title: "FAQs",
    href: "/dashboard/faqs",
    icon: HelpCircle,
    roles: ["admin", "moderator"],
    featureKey: null,
  },
  {
    title: "Courses",
    href: "/dashboard/courses",
    icon: GraduationCap,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_courses",
  },
  {
    title: "Menu",
    href: "/dashboard/menu",
    icon: Settings,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_menu",
  },
  {
    title: "Hero Slides",
    href: "/dashboard/hero-slides",
    icon: ImageIcon,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_hero_slides",
  },
  {
    title: "Hero Rotating Texts",
    href: "/dashboard/hero-rotating-texts",
    icon: FileText,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_hero_rotating_texts",
  },
  {
    title: "Testimonials",
    href: "/dashboard/testimonials",
    icon: MessageSquare,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_testimonials",
  },
  {
    title: "Study Goals",
    href: "/dashboard/study-goals",
    icon: GraduationCap,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_study_goals",
  },
  {
    title: "Scholarships",
    href: "/dashboard/scholarships",
    icon: Award,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_scholarships",
  },
  {
    title: "Events",
    href: "/dashboard/events",
    icon: Calendar,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_events",
  },
  {
    title: "Blog",
    href: "/dashboard/blog",
    icon: BookOpen,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_blog",
  },
  {
    title: "Counseling",
    href: "/dashboard/counseling",
    icon: Heart,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_counseling",
  },
  {
    title: "Students",
    href: "/dashboard/students",
    icon: Users,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_students",
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: UserCheck,
    roles: ["admin"],
    featureKey: "dashboard_users",
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_analytics",
  },
  {
    title: "OTP Management",
    href: "/dashboard/otp",
    icon: Shield,
    roles: ["admin"],
    featureKey: null, // OTP Management is always available for admins
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["admin", "moderator", "staff"],
    featureKey: null, // Settings is always available
  },
]

const menuGroups = [
  {
    label: "Main",
    items: ["Dashboard", "Analytics", "Leads", "Inquiries"]
  },
  {
    label: "Academic",
    items: ["Colleges", "Courses", "Scholarships", "Application Guides", "Placements"]
  },
  {
    label: "Users & Staff",
    items: ["Students", "Users", "Employees", "Attendance QR Code", "Attendance Records", "Counseling", "OTP Management"]
  },
  {
    label: "Marketing & Content",
    items: ["News", "Blog", "Events", "Testimonials", "Study Goals", "Hero Slides", "Hero Rotating Texts", "FAQs", "Menu"]
  },
  {
    label: "Engine",
    items: ["AI Enrichment", "Enrichment Results", "Settings"]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || "student"
  const [enabledFeatures, setEnabledFeatures] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchFeatureFlags = async () => {
      try {
        const response = await fetch("/api/feature-flags")
        if (response.ok) {
          const data = await response.json()
          const enabled = new Set<string>()
          data.flags.forEach((flag: { key: string; isEnabled: boolean }) => {
            if (flag.isEnabled) enabled.add(flag.key)
          })
          setEnabledFeatures(enabled)
        }
      } catch (error) {
        console.error("Error fetching feature flags:", error)
        allMenuItems.forEach((item) => {
          if (item.featureKey) enabledFeatures.add(item.featureKey)
        })
      }
    }
    fetchFeatureFlags()
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const isLinkEnabled = (item: typeof allMenuItems[0]) => {
    if (!item.roles.includes(userRole)) return false
    if (!item.featureKey) return true
    return enabledFeatures.has(item.featureKey)
  }

  const panelTitle = userRole === USER_ROLES.COUNSELOR ? "Counselor" : "Pro Admin"

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-950 text-slate-300 border-r border-white/5 relative z-50">
      {/* Brand Section */}
      <div className="p-6 mb-2">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform duration-500">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-0.5">{panelTitle}</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Control Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-4 pb-6 space-y-8 overflow-y-auto scrollbar-hide">
        {menuGroups.map((group) => {
          const itemsInGroup = allMenuItems.filter(i =>
            group.items.includes(i.title) && isLinkEnabled(i)
          )

          if (itemsInGroup.length === 0) return null

          return (
            <div key={group.label} className="space-y-2">
              <h3 className="px-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] mb-3">{group.label}</h3>
              <div className="space-y-1">
                {itemsInGroup.map((item) => {
                  const Icon = item.icon
                  const isActive = item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname === item.href || pathname?.startsWith(item.href + "/")

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-xs font-bold",
                        isActive
                          ? "bg-blue-600/10 text-blue-400 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)] border border-blue-600/20"
                          : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        isActive ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "bg-slate-900 group-hover:bg-slate-800"
                      )}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate flex-1 uppercase tracking-widest leading-none pt-0.5">{item.title}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.8)]" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-white/5 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 mb-3 border border-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
            {session?.user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-white truncate uppercase tracking-wider">{session?.user?.name || 'Administrator'}</p>
            <p className="text-[8px] font-bold text-slate-500 truncate uppercase mt-0.5">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all duration-500 w-full text-[10px] font-black uppercase tracking-[0.2em] group"
        >
          <LogOut className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

