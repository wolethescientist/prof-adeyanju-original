import { Globe, GraduationCap } from "lucide-react";
import Reveal from "./Reveal";

const pill =
  "cursor-pointer rounded-full px-7 py-3.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors duration-200";

export default function Footer() {
  return (
    <footer id="contact" className="relative bg-ink text-white pt-24 pb-12 overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(29,78,216,0.25),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <Reveal>
          <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.2em] text-white/60 mb-5">
            Connect
          </p>
          <h2 className="text-4xl md:text-6xl font-medium tracking-[-0.02em] leading-tight">
            Prof. Ibrahim Adepoju <em className="italic font-normal text-[#8fb0ff]">Adeyanju</em>
          </h2>
          <p className="mt-5 text-white/70">
            For speaking engagements, partnerships and media enquiries.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="https://www.linkedin.com/in/ibrahim-adeyanju-phd-6a5b7816/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${pill} bg-white text-ink hover:bg-[#dbe5ff]`}
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
              className={`${pill} border border-white/25 text-white hover:border-white/60`}
            >
              <Globe className="size-4" aria-hidden="true" />
              Galaxy Backbone
            </a>
            <a
              href="https://scholar.google.com/citations?user=Z97RmFAAAAAJ"
              target="_blank"
              rel="noopener noreferrer"
              className={`${pill} border border-white/25 text-white hover:border-white/60`}
            >
              <GraduationCap className="size-4" aria-hidden="true" />
              Google Scholar
            </a>
          </div>
        </Reveal>

        <div className="mt-20 pt-8 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
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
