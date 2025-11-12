export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-2 border-slate-200 rounded-full" />
          <div className="absolute inset-0 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

