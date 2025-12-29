"use client"

import { Facebook, Instagram, Phone, MessageCircle } from "lucide-react"
import Link from "next/link"

export function SocialIcons() {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1.5 sm:gap-2">
      <Link
        href="https://www.facebook.com/seemycampus"
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1877F2] text-white flex items-center justify-center hover:scale-105 sm:hover:scale-110 active:scale-95 transition-transform shadow-lg rounded-sm sm:rounded-none"
        aria-label="Facebook"
      >
        <Facebook className="h-5 w-5 sm:h-6 sm:w-6" />
      </Link>
      <Link
        href="tel:+918960147776"
        className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 text-white flex items-center justify-center hover:scale-105 sm:hover:scale-110 active:scale-95 transition-transform shadow-lg rounded-sm sm:rounded-none"
        aria-label="Call"
      >
        <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
      </Link>
      <Link
        href="https://www.instagram.com/seemycampus"
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white flex items-center justify-center hover:scale-105 sm:hover:scale-110 active:scale-95 transition-transform shadow-lg rounded-sm sm:rounded-none"
        aria-label="Instagram"
      >
        <Instagram className="h-5 w-5 sm:h-6 sm:w-6" />
      </Link>
      <Link
        href="https://wa.me/918960147776"
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 sm:w-12 sm:h-12 bg-[#25D366] text-white flex items-center justify-center hover:scale-105 sm:hover:scale-110 active:scale-95 transition-transform shadow-lg rounded-sm sm:rounded-none"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </Link>
    </div>
  )
}

