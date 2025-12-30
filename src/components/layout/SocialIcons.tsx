"use client"

import { Facebook, Instagram, Phone, MessageCircle } from "lucide-react"
import Link from "next/link"

export function SocialIcons() {
  return (
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
      {/* Facebook */}
      <Link
        href="https://www.facebook.com/seemycampus"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-12 h-12 sm:w-14 sm:h-14 bg-[#1877F2] text-white flex items-center justify-center rounded-xl hover:rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95"
        aria-label="Facebook"
      >
        <div className="absolute inset-0 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all"></div>
        <Facebook className="h-6 w-6 sm:h-7 sm:w-7 relative z-10" />
      </Link>

      {/* Phone */}
      <Link
        href="tel:+918960147776"
        className="group relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center rounded-xl hover:rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95"
        aria-label="Call"
      >
        <div className="absolute inset-0 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all"></div>
        <Phone className="h-6 w-6 sm:h-7 sm:w-7 relative z-10" />
      </Link>

      {/* Instagram */}
      <Link
        href="https://www.instagram.com/seemycampus"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white flex items-center justify-center rounded-xl hover:rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-pink-500/50 hover:scale-110 active:scale-95"
        aria-label="Instagram"
      >
        <div className="absolute inset-0 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all"></div>
        <Instagram className="h-6 w-6 sm:h-7 sm:w-7 relative z-10" />
      </Link>

      {/* WhatsApp */}
      <Link
        href="https://wa.me/918960147776"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] text-white flex items-center justify-center rounded-xl hover:rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-green-500/50 hover:scale-110 active:scale-95"
        aria-label="WhatsApp"
      >
        <div className="absolute inset-0 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all"></div>
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 relative z-10" />
      </Link>
    </div>
  )
}

