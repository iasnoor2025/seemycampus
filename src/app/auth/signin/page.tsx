"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [pendingMessage, setPendingMessage] = useState(false)

  useEffect(() => {
    if (searchParams?.get("pending") === "true") {
      setPendingMessage(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Check if error is about pending approval
        if (result.error === "PENDING_APPROVAL" || result.error.includes("PENDING_APPROVAL")) {
          setError("Your account is pending admin approval. Please wait for approval before signing in.")
        } else {
          setError("Invalid email or password")
        }
      } else {
        // Get callback URL from query params, default to /dashboard
        const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center space-y-4">
        <div className="flex items-center justify-center">
          <Image
            src="/main-logo-footer.png"
            alt="See My Campus Logo"
            width={300}
            height={100}
            className="h-24 md:h-32 w-auto object-contain"
            priority
            quality={90}
          />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">SEE MY CAMPUS</h1>
      </div>
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-white text-2xl">Sign In</CardTitle>
          <CardDescription className="text-white/90">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {pendingMessage && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  Your account has been created successfully! It is pending admin approval. You will be able to sign in once an admin approves your account.
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mb-8 flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center">
            <Image
              src="/main-logo-footer.png"
              alt="See My Campus Logo"
              width={300}
              height={100}
              className="h-24 md:h-32 w-auto object-contain"
              priority
              quality={90}
            />
          </div>
          <h1 className="text-3xl font-bold text-[#18254a]">SEE MY CAMPUS</h1>
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}

