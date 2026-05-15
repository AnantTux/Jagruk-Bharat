import Link from "next/link"
import { Github, Linkedin, Mail, Waves } from "lucide-react"
import { SITE } from "@/lib/site"

type SiteFooterProps = {
  compact?: boolean
}

export function SiteFooter({ compact = false }: SiteFooterProps) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="max-w-xl space-y-3">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <Waves className="h-5 w-5 text-amber-400" />
              <span className="text-lg font-bold text-white">{SITE.name}</span>
              <span className="text-sm text-amber-400/90">· {SITE.tagline}</span>
            </div>
            {!compact && (
              <p className="text-sm leading-relaxed text-slate-400">{SITE.about}</p>
            )}
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} {SITE.name}. Built by Anant.</p>
          </div>

          <div className="flex flex-col items-center gap-3 md:items-end">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Connect</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2 text-slate-300 transition-colors hover:text-amber-400"
              >
                <Mail className="h-4 w-4" />
                {SITE.email}
              </a>
              <a
                href={SITE.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-300 transition-colors hover:text-amber-400"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
              <a
                href={SITE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-300 transition-colors hover:text-amber-400"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
