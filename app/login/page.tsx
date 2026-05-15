import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Waves, Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SiteFooter } from "@/components/site-footer"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-lg border-slate-700 bg-slate-800/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-400 rounded-xl">
                <Waves className="w-7 h-7 text-slate-800" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
            <CardDescription className="text-slate-300">
              Sign in to your AnantTatt account to continue reporting and monitoring coastal hazards.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-11 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-white">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-11 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-amber-400 text-slate-800 hover:bg-amber-500"
              >
                <Shield className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </form>

            <div className="text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link href="/signup" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Sign up here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
      <SiteFooter compact />
    </div>
  )
}
