"use client"

import { Facebook, Instagram, Phone, MessageCircle } from "lucide-react"
import Link from "next/link"

export function SocialIcons() {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
      {/* Facebook */}
      <Link
        href="https://www.facebook.com/seemycampus"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-10 h-10 sm:w-11 sm:h-11 bg-[#1877F2] text-white flex items-center justify-center rounded-lg hover:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95"
        aria-label="Facebook"
      >
        <div className="absolute inset-0 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all"></div>
        <Facebook className="h-5 w-5 sm:h-5.5 sm:w-5.5 relative z-10" />
      </Link>

      {/* Phone */}
      <Link
        href="tel:+918960147776"
        className="group relative w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center rounded-lg hover:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95"
        aria-label="Call"
      >
        <div className="absolute inset-0 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all"></div>
        <Phone className="h-5 w-5 sm:h-5.5 sm:w-5.5 relative z-10" />
      </Link>

      {/* Instagram */}
      <Link
        href="https://www.instagram.com/seemycampus"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white flex items-center justify-center rounded-lg hover:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-pink-500/50 hover:scale-110 active:scale-95"
        aria-label="Instagram"
      >
        <div className="absolute inset-0 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all"></div>
        <Instagram className="h-5 w-5 sm:h-5.5 sm:w-5.5 relative z-10" />
      </Link>

      {/* WhatsApp */}
      <Link
        href="https://wa.me/918960147776"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-10 h-10 sm:w-11 sm:h-11 bg-[#25D366] text-white flex items-center justify-center rounded-lg hover:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/50 hover:scale-110 active:scale-95"
        aria-label="WhatsApp"
      >
        <div className="absolute inset-0 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all"></div>
        <MessageCircle className="h-5 w-5 sm:h-5.5 sm:w-5.5 relative z-10" />
      </Link>
    </div>
  )
}
