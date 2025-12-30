"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterBar() {
  const [email, setEmail] = useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Subscribed:", email)
    setEmail("")
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-4">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 text-white py-4 px-6 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 rounded-full blur-3xl"></div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
            <h3 className="text-lg md:text-xl font-bold text-white">
              Subscribe to our Newsletter
            </h3>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto flex-shrink-0">
              <Input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/95 backdrop-blur-sm text-gray-900 border-0 rounded-lg px-4 py-2.5 min-w-[200px] md:min-w-[220px] placeholder:text-gray-400 text-sm shadow-md focus:bg-white"
                required
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white uppercase px-5 py-2.5 font-bold rounded-lg whitespace-nowrap text-sm shadow-lg hover:shadow-xl transition-all"
              >
                SUBSCRIBE
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

