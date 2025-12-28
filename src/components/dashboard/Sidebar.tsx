"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Heart
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Colleges",
    href: "/dashboard/colleges",
    icon: Building2,
  },
  {
    title: "Courses",
    href: "/dashboard/courses",
    icon: GraduationCap,
  },
  {
    title: "Menu",
    href: "/dashboard/menu",
    icon: Settings,
  },
  {
    title: "Hero Slides",
    href: "/dashboard/hero-slides",
    icon: ImageIcon,
  },
  {
    title: "Hero Rotating Texts",
    href: "/dashboard/hero-rotating-texts",
    icon: FileText,
  },
  {
    title: "Testimonials",
    href: "/dashboard/testimonials",
    icon: MessageSquare,
  },
  {
    title: "Study Goals",
    href: "/dashboard/study-goals",
    icon: GraduationCap,
  },
  {
    title: "Scholarships",
    href: "/dashboard/scholarships",
    icon: Award,
  },
  {
    title: "Events",
    href: "/dashboard/events",
    icon: Calendar,
  },
  {
    title: "Blog",
    href: "/dashboard/blog",
    icon: BookOpen,
  },
  {
    title: "Counseling",
    href: "/dashboard/counseling",
    icon: Heart,
  },
  {
    title: "Students",
    href: "/dashboard/students",
    icon: Users,
  },
  {
    title: "Leads",
    href: "/dashboard/leads",
    icon: FileText,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <div className="flex flex-col h-screen w-64 bg-[#18254a] text-white border-r border-white/10">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6" />
          <span className="text-lg font-bold">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-white/20 text-white font-medium"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

