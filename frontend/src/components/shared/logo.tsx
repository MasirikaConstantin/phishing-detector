export function Logo() {
  return (
    <div className="inline-flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-blue-500/20">
        PD
      </div>
      <div>
        <p className="font-display text-base font-bold">Phishing Detector</p>
        <p className="text-xs text-muted-foreground">Plateforme académique</p>
      </div>
    </div>
  );
}
