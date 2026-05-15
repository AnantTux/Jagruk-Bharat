import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Waves, UserPlus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SiteFooter } from "@/components/site-footer"
import { COASTAL_REGIONS } from "@/lib/coastal-regions"

export default function SignupPage() {
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
            <CardTitle className="text-2xl font-bold text-white">Join AnantTatt</CardTitle>
            <CardDescription className="text-slate-300">
              Create your account to start reporting coastal hazards on the Endless Coast map.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-white">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    className="h-11 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-white">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    className="h-11 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  className="h-11 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coastalRegion" className="text-sm font-medium text-white">
                  Your Coastal Region
                </Label>
                <Select name="coastalRegion" required>
                  <SelectTrigger
                    id="coastalRegion"
                    className="h-11 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20"
                  >
                    <SelectValue placeholder="Select your coastline for local alerts" />
                  </SelectTrigger>
                  <SelectContent>
                    {COASTAL_REGIONS.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">
                  Hazard emails are filtered to reports near your selected coastline.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-white">
                  Your Role
                </Label>
                <Select>
                  <SelectTrigger className="h-11 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">Concerned Citizen</SelectItem>
                    <SelectItem value="lifeguard">Lifeguard</SelectItem>
                    <SelectItem value="marine-biologist">Marine Biologist</SelectItem>
                    <SelectItem value="emergency-responder">Emergency Responder</SelectItem>
                    <SelectItem value="researcher">Researcher</SelectItem>
                    <SelectItem value="government">Government Official</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  className="h-11 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="h-11 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20"
                  required
                />
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-slate-600 bg-slate-700/50 p-3">
                <Checkbox
                  id="notifications"
                  className="mt-0.5 size-[18px] border-slate-400 bg-slate-600 shadow-sm data-[state=checked]:border-amber-400 data-[state=checked]:bg-amber-400 data-[state=checked]:text-slate-900"
                />
                <Label htmlFor="notifications" className="cursor-pointer text-sm leading-snug text-slate-200">
                  Send me email notifications about hazard alerts in my area
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-amber-400 text-slate-800 hover:bg-amber-500"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </form>

            <div className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Sign in here
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



