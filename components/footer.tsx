import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-background lg:mt-0">
      <div className="w-full max-w-[1920px] mx-auto px-3 py-4 lg:px-6 lg:py-8 xl:px-8 pb-20 lg:pb-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          {/* Left section: Copyright and links */}
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
            <p className="text-xs lg:text-sm text-muted-foreground text-center lg:text-left">
              © {new Date().getFullYear()} timediffs.app
            </p>
            <div className="flex items-center justify-center gap-2.5 lg:gap-3 text-xs lg:text-sm lg:justify-start">
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
          <div className="flex items-center justify-center gap-2.5 lg:justify-end lg:gap-4">
            <p className="text-sm text-muted-foreground hidden lg:block">
              A simple tool for comparing timezones
            </p>
            <Link
              href="https://github.com/mochixlb/timediffs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 -m-1 lg:p-1.5 lg:-m-1.5 rounded-sm hover:bg-accent/50"
              aria-label="View source code on GitHub"
            >
              <Github className="h-4 w-4 lg:h-5 lg:w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

