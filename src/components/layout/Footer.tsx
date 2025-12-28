"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Globe, ChevronRight, Facebook, Instagram, Linkedin } from "lucide-react"
import Image from "next/image"

export function Footer() {
  const [email, setEmail] = useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Subscribed:", email)
    setEmail("")
  }

  return (
    <footer className="mt-16">
      {/* Top Section - Newsletter Subscription (Dark Blue) - Overlapping */}
      <div className="bg-[#18254a] text-white py-6 -mt-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <h3 className="text-2xl md:text-3xl font-bold text-white">Subscribe to our Newsletter</h3>
            <form onSubmit={handleSubscribe} className="flex gap-3 w-full md:w-auto flex-shrink-0">
              <Input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-gray-900 border-0 rounded-md px-4 py-3 min-w-[200px] md:min-w-[250px]"
                required
                suppressHydrationWarning
              />
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white uppercase px-6 py-3 font-bold rounded-md whitespace-nowrap"
              >
                SUBSCRIBE
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Middle Section - Main Footer Content (Red) */}
      <div className="bg-red-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1 - Logo and Description */}
            <div>
              <div className="mb-6">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center p-2 mb-4 shadow-lg">
                  <div className="w-full h-full flex items-center justify-center relative">
                    <Image
                      src="/main-logo-footer.png"
                      alt="See My Campus Logo"
                      width={120}
                      height={120}
                      className="w-full h-full object-contain p-1"
                      quality={85}
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-white">
                Seemycampus is a one stop shop to n number of campuses nationwide, keeping Seemycampus at the nexus of ideas that challenge and change the world.
              </p>
            </div>

            {/* Column 2 - Courses */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Courses</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/colleges/management" className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
                    <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>Management</span>
                  </Link>
                </li>
                <li>
                  <Link href="/colleges/engineering" className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
                    <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>Engineering</span>
                  </Link>
                </li>
                <li>
                  <Link href="/colleges/medical" className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
                    <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>Medical</span>
                  </Link>
                </li>
                <li>
                  <Link href="/colleges/design" className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
                    <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>Design</span>
                  </Link>
                </li>
                <li>
                  <Link href="/colleges/law" className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
                    <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>Law</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Information */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Information</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/" className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
                    <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
                    <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link href="/academic-alliance" className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
                    <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>Academic Alliance</span>
                  </Link>
                </li>
                <li>
                  <Link href="/career-counseling" className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
                    <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>Career Councelling</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
                    <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>Contact Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Contact us */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Contact us</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 text-white">
                  <Mail className="h-5 w-5 text-white flex-shrink-0" />
                  <a href="mailto:info@seemycampus.com" className="hover:text-gray-200 transition-colors">
                    info@seemycampus.com
                  </a>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Globe className="h-5 w-5 text-white flex-shrink-0" />
                  <a href="https://www.seemycampus.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200 transition-colors">
                    www.seemycampus.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Copyright and Social Media (Light Gray) */}
      <div className="bg-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-700 text-sm">
              Seemycampus {new Date().getFullYear() === 2015 ? '2015' : `2015-${new Date().getFullYear()}`}, All Rights Reserved
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700 border-2 border-white flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-white" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700 border-2 border-white flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700 border-2 border-white flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
