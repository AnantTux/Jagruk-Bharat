import Link from "next/link"
import { Waves } from "lucide-react"
import { SITE } from "@/lib/site"

type SiteBrandProps = {
  href?: string
  subtitle?: string
}

export function SiteBrand({ href = "/", subtitle }: SiteBrandProps) {
  return (
    <Link href={href} className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 shadow-lg">
        <Waves className="h-6 w-6 text-slate-900" />
      </div>
      <div>
        <p className="text-xl font-bold tracking-tight text-white">{SITE.name}</p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
          {subtitle ?? SITE.tagline}
        </p>
      </div>
    </Link>
  )
}
