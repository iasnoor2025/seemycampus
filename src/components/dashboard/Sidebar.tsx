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
    title: "Cutoffs",
    href: "/dashboard/cutoffs",
    icon: Award,
    roles: ["admin", "moderator", "staff"],
    featureKey: "dashboard_cutoffs",
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

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || "student"
  const [enabledFeatures, setEnabledFeatures] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Fetch feature flags for dashboard pages
    const fetchFeatureFlags = async () => {
      try {
        const response = await fetch("/api/feature-flags")
        if (response.ok) {
          const data = await response.json()
          const enabled = new Set<string>()
          data.flags.forEach((flag: { key: string; isEnabled: boolean }) => {
            if (flag.isEnabled) {
              enabled.add(flag.key)
            }
          })
          setEnabledFeatures(enabled)
        }
      } catch (error) {
        console.error("Error fetching feature flags:", error)
        // Default to all enabled if fetch fails
        allMenuItems.forEach((item) => {
          if (item.featureKey) {
            enabledFeatures.add(item.featureKey)
          }
        })
      }
    }
    fetchFeatureFlags()
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  // Filter menu items based on user role and feature flags
  const menuItems = allMenuItems.filter((item) => {
    // Check role first
    if (!item.roles.includes(userRole)) {
      return false
    }
    // If no feature key, always show (Dashboard, Settings)
    if (!item.featureKey) {
      return true
    }
    // Check if feature is enabled
    return enabledFeatures.has(item.featureKey)
  })

  const panelTitle = userRole === USER_ROLES.COUNSELOR ? "Counselor Panel" : "Admin Panel"

  return (
    <div className="flex flex-col h-screen w-56 bg-[#18254a] text-white border-r border-white/10">
      {/* Logo Section */}
      <div className="p-3 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          <span className="text-sm font-bold">{panelTitle}</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          // Fix: For Dashboard, only match exact path. For others, match exact or sub-routes
          const isActive = item.href === "/dashboard" 
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(item.href + "/")
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm",
                isActive
                  ? "bg-red-500 text-white font-medium"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors w-full text-sm"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

