import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Waves, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
        </div>

        <Card className="shadow-lg border-slate-700 bg-slate-800/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-400 rounded-xl">
                <Waves className="w-7 h-7 text-slate-800" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Reset Password</CardTitle>
            <CardDescription className="text-slate-300">
              Enter your email address and we'll send you a link to reset your password.
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
                  placeholder="Enter your email address"
                  className="h-11 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-amber-400 text-slate-800 hover:bg-amber-500"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Reset Link
              </Button>
            </form>

            <div className="text-center text-sm text-slate-400">
              Remember your password?{" "}
              <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-slate-400">
          If you don't receive an email within a few minutes, please check your spam folder or{" "}
          <Link href="/contact" className="text-amber-400 hover:text-amber-300 transition-colors">
            contact support
          </Link>
        </div>
      </div>
    </div>
  )
}
