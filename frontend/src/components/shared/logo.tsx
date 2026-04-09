export function Logo() {
  return (
    <div className="inline-flex min-w-0 items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-blue-500/20">
        PD
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-bold sm:text-base">Phishing Detector</p>
        <p className="truncate text-xs text-muted-foreground">Plateforme académique</p>
      </div>
    </div>
  );
}
