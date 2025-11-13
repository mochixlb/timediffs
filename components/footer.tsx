import Link from "next/link";
import { siteConfig } from "@/lib/seo";
import { Github } from "lucide-react";
import { LogoIcon } from "@/components/logo-icon";

export function Footer() {
  const githubUrl = "https://github.com/mochixlb/timediffs";

  return (
    <footer
      className="w-full border-t bg-background safe-area-inset-bottom"
      aria-label="Site footer"
    >
      <div className="w-full max-w-[1920px] mx-auto px-4 lg:px-6 xl:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-center md:justify-between py-8 md:py-8">
          {/* Mobile layout: refined, elegant design */}
          <div className="w-full md:hidden">
            {/* Logo and Title Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center gap-2.5 mb-1">
                <LogoIcon className="h-7 w-7 text-foreground shrink-0" />
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  timediffs.app
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {siteConfig.description}
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-border mb-6" aria-hidden="true" />

            {/* Links and Actions Grid */}
            <div className="flex flex-col gap-4">
              {/* Legal Links */}
              <nav
                className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
                aria-label="Legal"
              >
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors px-4 py-3 min-h-[44px] flex items-center touch-manipulation"
                >
                  Privacy Policy
                </Link>
                <div className="w-px h-4 bg-border" aria-hidden="true" />
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors px-4 py-3 min-h-[44px] flex items-center touch-manipulation"
                >
                  Terms of Use
                </Link>
              </nav>

              {/* Bottom Row: GitHub */}
              <div className="flex items-center justify-center">
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-4 py-3 min-h-[44px] touch-manipulation"
                  aria-label="View project on GitHub (opens in a new tab)"
                  title="GitHub"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>

          {/* Desktop/tablet layout */}
          <div className="hidden md:flex items-center justify-between w-full">
            {/* Left cluster */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                © 2025 {siteConfig.name}
              </span>
              <nav className="flex items-center gap-3" aria-label="Legal">
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                <span className="select-none text-muted-foreground">·</span>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Use
                </Link>
              </nav>
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground hidden lg:inline">
                {siteConfig.description}
              </span>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="View project on GitHub (opens in a new tab)"
                title="GitHub"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
