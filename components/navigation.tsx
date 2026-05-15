import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Waves, Map, Camera, TrendingUp } from "lucide-react"

export function Navigation() {
  return (
    <nav className="flex items-center gap-4">
      <Link href="/">
        <Button variant="ghost" size="sm">
          <Waves className="w-4 h-4 mr-2" />
          Home
        </Button>
      </Link>
      <Link href="/dashboard">
        <Button variant="ghost" size="sm">
          <Map className="w-4 h-4 mr-2" />
          Map Dashboard
        </Button>
      </Link>
      <Link href="/report">
        <Button variant="ghost" size="sm">
          <Camera className="w-4 h-4 mr-2" />
          Report Hazard
        </Button>
      </Link>
      <Link href="/analytics">
        <Button variant="ghost" size="sm">
          <TrendingUp className="w-4 h-4 mr-2" />
          Social Analytics
        </Button>
      </Link>
    </nav>
  )
}
