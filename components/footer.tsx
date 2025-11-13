import Link from "next/link";
import { siteConfig } from "@/lib/seo";
import { Github } from "lucide-react";

export function Footer() {
  const githubUrl = "https://github.com/mochixlb/timediffs";

  return (
    <footer
      className="w-full border-t bg-background safe-area-inset-bottom"
      aria-label="Site footer"
    >
      <div className="w-full max-w-[1920px] mx-auto px-4 lg:px-6 xl:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-center md:justify-between gap-5 md:gap-6 py-6 md:py-8">
          {/* Mobile layout: centered, balanced stack */}
          <div className="w-full flex flex-col items-center gap-3 md:hidden">
            <span className="text-sm text-foreground">
              © 2025 {siteConfig.name}
            </span>
            <nav
              className="flex items-center gap-3 text-sm text-muted-foreground"
              aria-label="Legal"
            >
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="select-none">·</span>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms of Use
              </Link>
            </nav>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              aria-label="View project on GitHub (opens in a new tab)"
              title="GitHub"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Desktop/tablet left cluster */}
          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <span className="text-foreground">© 2025 {siteConfig.name}</span>
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

          {/* Desktop/tablet right cluster */}
          <div className="hidden md:flex items-center justify-end gap-3 text-sm text-muted-foreground">
            <span className="hidden md:inline">{siteConfig.description}</span>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="View project on GitHub (opens in a new tab)"
              title="GitHub"
            >
              <Github className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
