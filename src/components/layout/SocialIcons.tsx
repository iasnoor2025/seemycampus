"use client"

import { Facebook, Instagram, Phone, MessageCircle } from "lucide-react"
import Link from "next/link"

export function SocialIcons() {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1.5 pr-1.5 sm:pr-0">
      {/* Facebook */}
      <Link
        href="https://www.facebook.com/seemycampus"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-8 h-8 sm:w-10 sm:h-10 bg-[#1877F2] text-white flex items-center justify-center rounded-lg hover:rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-x-1 active:scale-95"
        aria-label="Facebook"
      >
        <div className="absolute inset-0 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all"></div>
        <Facebook className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
      </Link>

      {/* Phone */}
      <Link
        href="tel:+918960147776"
        className="group relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center rounded-lg hover:rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-x-1 active:scale-95"
        aria-label="Call"
      >
        <div className="absolute inset-0 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all"></div>
        <Phone className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
      </Link>

      {/* Instagram */}
      <Link
        href="https://www.instagram.com/seemycampus"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white flex items-center justify-center rounded-lg hover:rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-pink-500/30 hover:-translate-x-1 active:scale-95"
        aria-label="Instagram"
      >
        <div className="absolute inset-0 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all"></div>
        <Instagram className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
      </Link>

      {/* WhatsApp */}
      <Link
        href="https://wa.me/918960147776"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-8 h-8 sm:w-10 sm:h-10 bg-[#25D366] text-white flex items-center justify-center rounded-lg hover:rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-green-500/30 hover:-translate-x-1 active:scale-95"
        aria-label="WhatsApp"
      >
        <div className="absolute inset-0 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all"></div>
        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
      </Link>
    </div>
  )
}
