import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoIcon } from "@/components/logo-icon";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";

/**
 * 404 Not Found page.
 * Displays when a user navigates to a page that doesn't exist.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full max-w-[1920px] mx-auto px-3 py-4 lg:px-6 lg:py-8 xl:px-8 flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
          >
            <LogoIcon className="h-5 w-5 text-foreground shrink-0" />
            <h1 className="text-xl font-medium tracking-tight">
              timediffs.app
            </h1>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 max-w-lg mx-auto text-center px-4">
            {/* Large 404 Text */}
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-[120px] lg:text-[160px] font-bold text-foreground leading-none tracking-tight">
                404
              </h1>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground">
                Page not found
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Looks like this page is in a different timezone—one that doesn't
                exist. Don't worry, you can always find your way back home.
              </p>
            </div>

            {/* Action Button */}
            <Button variant="default" asChild className="gap-2 mt-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Go back home
              </Link>
            </Button>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
