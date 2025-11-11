import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-background">
      <div className="w-full max-w-[1920px] mx-auto px-3 py-6 md:px-6 md:py-8 lg:py-10 xl:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left section: Copyright and links */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} timediffs.app
            </p>
            <div className="flex items-center justify-center gap-3 text-sm md:justify-start">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors py-1 px-1 -mx-1"
              >
                Privacy Policy
              </Link>
              <span className="text-muted-foreground/50">·</span>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors py-1 px-1 -mx-1"
              >
                Terms of Use
              </Link>
            </div>
          </div>
          {/* Right section: Tagline and GitHub */}
          <div className="flex items-center justify-center gap-3 md:justify-end md:gap-4">
            <p className="text-sm text-muted-foreground hidden md:block">
              A simple tool for comparing timezones
            </p>
            <Link
              href="https://github.com/mochixlb/timediffs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-1.5 -m-1.5 rounded-sm hover:bg-accent/50"
              aria-label="View source code on GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

