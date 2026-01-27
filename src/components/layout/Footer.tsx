"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Globe, ChevronRight, Facebook, Instagram, Linkedin, Phone, MapPin, Send, Sparkles } from "lucide-react"
import Image from "next/image"

interface Category {
  id: number
  name: string
  slug: string
  displayOrder: number
}

export function Footer() {
  const [email, setEmail] = useState("")
  const [contactInfo, setContactInfo] = useState({
    email: "info@seemycampus.com",
    phone: "+91-XXX-XXX-XXXX",
    address: "New Delhi, India",
  })
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    // Fetch contact information
    fetch("/api/settings/contact")
      .then((res) => res.json())
      .then((data) => {
        if (data.email) setContactInfo(data)
      })
      .catch(() => {
        // Use defaults if fetch fails
      })

    // Fetch categories for footer links
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        // API returns { menu: [...] }, so check data.menu
        const menuData = data?.menu || (Array.isArray(data) ? data : [])
        if (Array.isArray(menuData) && menuData.length > 0) {
          // Extract categories from menu structure
          const footerCategories = menuData
            .map((item: any) => ({
              id: item.id,
              name: item.name,
              slug: item.slug,
              displayOrder: item.displayOrder || 0,
            }))
            .filter((cat: Category) => cat.slug) // Only include items with slugs
            .sort((a: Category, b: Category) => a.displayOrder - b.displayOrder)
            .slice(0, 5) // Limit to top 5 categories for footer
          setCategories(footerCategories)
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error)
        // Fallback to default categories if API fails
        setCategories([
          { id: 1, name: "Management", slug: "management", displayOrder: 1 },
          { id: 2, name: "Engineering", slug: "engineering", displayOrder: 2 },
          { id: 3, name: "Medical", slug: "medical", displayOrder: 3 },
          { id: 4, name: "Design", slug: "design", displayOrder: 4 },
          { id: 5, name: "Law", slug: "law", displayOrder: 5 },
        ])
      })
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Subscribed:", email)
    setEmail("")
  }

  return (
    <footer className="mt-16">
      {/* Top Section - Newsletter Subscription */}
      <div className="bg-slate-900 border-y border-white/5 py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl mb-6 border border-blue-500/20">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-black text-sm uppercase tracking-widest">Premium Updates</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                  Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Elite</span> Student Community
                </h3>
                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
                  Get exclusive access to premium campus insights, admission hacks, and expert counseling delivered straight to your inbox.
                </p>
              </div>

              <div className="w-full lg:w-[450px]">
                <div className="glass-morphism p-2 rounded-[2rem] border-white/5 shadow-2xl">
                  <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-900/50 border-none text-white placeholder:text-slate-600 rounded-2xl h-16 pl-14 pr-6 focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                        required
                        suppressHydrationWarning
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white h-16 text-base font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all group"
                    >
                      <Send className="h-5 w-5 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      Scale Your Future
                    </Button>
                  </form>
                  <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">
                    No spam. Only high-value insights. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Main Footer Content */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Column 1 - Logo and Description */}
            <div className="lg:col-span-1">
              <div className="mb-8">
                <Link href="/" className="inline-block group">
                  <div className="relative">
                    <div className="w-32 h-32 flex items-center justify-center p-4 mb-4 transition-all duration-300 group-hover:scale-105">
                      <div className="w-full h-full flex items-center justify-center">
                        <Image
                          src="/main-logo-footer.png"
                          alt="See My Campus Logo"
                          width={120}
                          height={120}
                          className="w-full h-full object-contain"
                          quality={75}
                          priority
                        />
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                </Link>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                SeeMyCampus
              </h3>
              <p className="text-sm leading-relaxed text-white/80 mb-6">
                Seemycampus is a one stop shop to n number of campuses nationwide, keeping Seemycampus at the nexus of ideas that challenge and change the world.
              </p>
              {/* Social Media Icons */}
              <div className="flex items-center gap-3">
                <a
                  href="https://www.facebook.com/seemycampus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all group"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://www.instagram.com/seemycampus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-pink-600 hover:border-pink-600 transition-all group"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://www.linkedin.com/company/seemycampus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-blue-700 hover:border-blue-700 transition-all group"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            {/* Column 2 - Courses */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                Courses
              </h3>
              <ul className="space-y-3">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/colleges/${category.slug}`}
                        className="flex items-center gap-2 text-white/80 hover:text-white hover:translate-x-1 transition-all group"
                      >
                        <ChevronRight className="h-4 w-4 text-blue-400 flex-shrink-0 group-hover:text-blue-300" />
                        <span>{category.name}</span>
                      </Link>
                    </li>
                  ))
                ) : (
                  // Fallback while loading or if no categories
                  <>
                    <li>
                      <Link href="/colleges/management" className="flex items-center gap-2 text-white/80 hover:text-white hover:translate-x-1 transition-all group">
                        <ChevronRight className="h-4 w-4 text-blue-400 flex-shrink-0 group-hover:text-blue-300" />
                        <span>Management</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/colleges/engineering" className="flex items-center gap-2 text-white/80 hover:text-white hover:translate-x-1 transition-all group">
                        <ChevronRight className="h-4 w-4 text-blue-400 flex-shrink-0 group-hover:text-blue-300" />
                        <span>Engineering</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/colleges/medical" className="flex items-center gap-2 text-white/80 hover:text-white hover:translate-x-1 transition-all group">
                        <ChevronRight className="h-4 w-4 text-blue-400 flex-shrink-0 group-hover:text-blue-300" />
                        <span>Medical</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/colleges/design" className="flex items-center gap-2 text-white/80 hover:text-white hover:translate-x-1 transition-all group">
                        <ChevronRight className="h-4 w-4 text-blue-400 flex-shrink-0 group-hover:text-blue-300" />
                        <span>Design</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/colleges/law" className="flex items-center gap-2 text-white/80 hover:text-white hover:translate-x-1 transition-all group">
                        <ChevronRight className="h-4 w-4 text-blue-400 flex-shrink-0 group-hover:text-blue-300" />
                        <span>Law</span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Column 3 - Information */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                Information
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white hover:translate-x-1 transition-all group">
                    <ChevronRight className="h-4 w-4 text-indigo-400 flex-shrink-0 group-hover:text-indigo-300" />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="flex items-center gap-2 text-white/80 hover:text-white hover:translate-x-1 transition-all group">
                    <ChevronRight className="h-4 w-4 text-indigo-400 flex-shrink-0 group-hover:text-indigo-300" />
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link href="/academic-alliance" className="flex items-center gap-2 text-white/80 hover:text-white hover:translate-x-1 transition-all group">
                    <ChevronRight className="h-4 w-4 text-indigo-400 flex-shrink-0 group-hover:text-indigo-300" />
                    <span>Academic Alliance</span>
                  </Link>
                </li>
                <li>
                  <Link href="/career-counseling" className="flex items-center gap-2 text-white/80 hover:text-white hover:translate-x-1 transition-all group">
                    <ChevronRight className="h-4 w-4 text-indigo-400 flex-shrink-0 group-hover:text-indigo-300" />
                    <span>Career Counseling</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="flex items-center gap-2 text-white/80 hover:text-white hover:translate-x-1 transition-all group">
                    <ChevronRight className="h-4 w-4 text-indigo-400 flex-shrink-0 group-hover:text-indigo-300" />
                    <span>Contact Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Contact us */}
            <div>
              <h3 className="text-xl font-black mb-8 text-white flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                CONNECT
              </h3>
              <div className="space-y-4">
                <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors break-all">
                      {contactInfo.email}
                    </p>
                  </div>
                </a>

                <a href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {contactInfo.phone}
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">HQ Address</p>
                    <p className="text-sm font-bold text-white leading-tight">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Copyright */}
      <div className="bg-slate-900 border-t border-slate-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              © Seemycampus {new Date().getFullYear() === 2015 ? '2015' : `2015-${new Date().getFullYear()}`}, All Rights Reserved
            </p>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <span>•</span>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
