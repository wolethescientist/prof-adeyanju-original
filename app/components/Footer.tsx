import { Globe, GraduationCap } from "lucide-react";
import Reveal from "./Reveal";

const link =
  "inline-flex items-center gap-2 rounded-lg border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/60";

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-ink text-white pt-16 pb-10">
      <div
        className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(29,78,216,0.25),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Prof. Ibrahim Adepoju Adeyanju
        </h2>
        <p className="mt-3 text-white/70">
          For speaking engagements, partnerships and media enquiries.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="https://www.linkedin.com/in/ibrahim-adeyanju-phd-6a5b7816/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-white/90"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
            </svg>
            LinkedIn
          </a>
          <a
            href="https://galaxybackbone.com.ng"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            <Globe className="size-4" aria-hidden="true" />
            Galaxy Backbone
          </a>
          <a
            href="https://scholar.google.com/citations?user=Z97RmFAAAAAJ"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            <GraduationCap className="size-4" aria-hidden="true" />
            Google Scholar
          </a>
        </div>

        </Reveal>

        <div className="mt-14 pt-6 border-t border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Prof. Ibrahim Adepoju Adeyanju. All rights reserved.</p>
          <p>
            MD/CEO, Galaxy Backbone Limited · Federal Ministry of Communications,
            Innovation & Digital Economy
          </p>
        </div>
      </div>
    </footer>
  );
}
