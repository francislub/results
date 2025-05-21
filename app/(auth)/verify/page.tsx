"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import Link from "next/link"
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react"

export default function VerifyPage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate verification delay
    setTimeout(() => {
      if (code === "12345") {
        toast({
          title: "Success",
          description: "Verification successful",
        })
        router.push("/register")
      } else {
        setError("Invalid verification code. Please try again.")
        toast({
          title: "Error",
          description: "Invalid verification code",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-24 h-24 mb-4">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
            <Image src="/logo.png?height=96&width=96" alt="Vurra Secondary School Logo" fill className="rounded-full" />
          </div>
          <h1 className="text-2xl font-bold">Vurra Secondary School</h1>
          <p className="text-muted-foreground">Admin Verification</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-full bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Verification Required</CardTitle>
            <CardDescription className="text-center">
              Please enter the verification code to continue with registration
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  placeholder="Enter verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center text-lg tracking-widest h-12"
                  maxLength={5}
                  required
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <div className="text-sm text-muted-foreground text-center">
                <p>
                  Use code: <span className="font-semibold">The code is only known by the admin</span>
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help? Contact the school administrator at{" "}
            <a href="mailto:admin@vurrasecondary.edu" className="text-primary hover:underline">
              admin@vurrasecondary.edu
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
