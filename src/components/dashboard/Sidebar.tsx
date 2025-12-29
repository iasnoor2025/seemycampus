"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
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
  UserCheck
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
  },
  {
    title: "Leads",
    href: "/dashboard/leads",
    icon: FileText,
    roles: ["admin", "moderator", "staff", "counselor"],
  },
  {
    title: "Colleges",
    href: "/dashboard/colleges",
    icon: Building2,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Cutoffs",
    href: "/dashboard/cutoffs",
    icon: Award,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Placements",
    href: "/dashboard/placements",
    icon: BarChart3,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Application Guides",
    href: "/dashboard/application-guides",
    icon: FileText,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Inquiries",
    href: "/dashboard/inquiries",
    icon: MessageSquare,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Courses",
    href: "/dashboard/courses",
    icon: GraduationCap,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Menu",
    href: "/dashboard/menu",
    icon: Settings,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Hero Slides",
    href: "/dashboard/hero-slides",
    icon: ImageIcon,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Hero Rotating Texts",
    href: "/dashboard/hero-rotating-texts",
    icon: FileText,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Testimonials",
    href: "/dashboard/testimonials",
    icon: MessageSquare,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Study Goals",
    href: "/dashboard/study-goals",
    icon: GraduationCap,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Scholarships",
    href: "/dashboard/scholarships",
    icon: Award,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Events",
    href: "/dashboard/events",
    icon: Calendar,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Blog",
    href: "/dashboard/blog",
    icon: BookOpen,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Counseling",
    href: "/dashboard/counseling",
    icon: Heart,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Students",
    href: "/dashboard/students",
    icon: Users,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: UserCheck,
    roles: ["admin"],
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["admin", "moderator", "staff"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["admin", "moderator", "staff"],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || "student"

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(userRole)
  )

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

