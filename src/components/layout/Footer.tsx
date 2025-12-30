"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Globe, ChevronRight, Facebook, Instagram, Linkedin, Phone, MapPin, Send, Sparkles } from "lucide-react"
import Image from "next/image"

export function Footer() {
  const [email, setEmail] = useState("")
  const [contactInfo, setContactInfo] = useState({
    email: "info@seemycampus.com",
    phone: "+91-XXX-XXX-XXXX",
    address: "New Delhi, India",
  })

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
      <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 text-white py-12 -mt-16 relative z-10">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium text-sm">Stay Updated</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                Subscribe to our Newsletter
              </h3>
              <p className="text-white/90">Get the latest updates on colleges, courses, and admission guidance</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 backdrop-blur-sm text-white placeholder:text-white/70 border-white/20 rounded-lg px-4 py-3 flex-1 focus:bg-white/20 focus:border-white/40"
                required
                suppressHydrationWarning
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 font-semibold rounded-lg whitespace-nowrap shadow-lg hover:shadow-xl transition-all"
              >
                <Send className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            </form>
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
                    <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center p-4 mb-4 shadow-2xl group-hover:shadow-white/50 transition-all duration-300 group-hover:scale-105 border-2 border-white/20">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl"></div>
                      <div className="w-full h-full flex items-center justify-center relative z-10">
                        <Image
                          src="/main-logo-footer.png"
                          alt="See My Campus Logo"
                          width={120}
                          height={120}
                          className="w-full h-full object-contain"
                          quality={90}
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
              <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full"></div>
                Contact us
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Email</p>
                    <a href={`mailto:${contactInfo.email}`} className="text-white hover:text-blue-300 transition-colors break-all">
                      {contactInfo.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Phone</p>
                    <a href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, "")}`} className="text-white hover:text-blue-300 transition-colors">
                      {contactInfo.phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Address</p>
                    <p className="text-white">{contactInfo.address}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Website</p>
                    <a href="https://www.seemycampus.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-300 transition-colors">
                      www.seemycampus.com
                    </a>
                  </div>
                </li>
              </ul>
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
