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
    <div className="bg-white py-4">
      <div className="container mx-auto px-4">
        <div className="bg-[hsl(210,50%,25%)] text-white py-4 px-6 rounded-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h3 className="text-lg md:text-xl font-bold text-white">
              Subscribe to our Newsletter
            </h3>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto flex-shrink-0">
              <Input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-gray-900 border-0 rounded px-4 py-2.5 min-w-[200px] md:min-w-[220px] placeholder:text-gray-400 text-sm"
                required
              />
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white uppercase px-5 py-2.5 font-bold rounded whitespace-nowrap text-sm"
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

