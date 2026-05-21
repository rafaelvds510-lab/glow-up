export function ColumnLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="6" y="4" width="28" height="3" />
      <rect x="8" y="7" width="24" height="2" />
      <line x1="12" y1="10" x2="12" y2="40" />
      <line x1="17" y1="10" x2="17" y2="40" />
      <line x1="23" y1="10" x2="23" y2="40" />
      <line x1="28" y1="10" x2="28" y2="40" />
      <rect x="8" y="40" width="24" height="2" />
      <rect x="6" y="42" width="28" height="3" />
    </svg>
  );
}

export function LaurelDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 text-gold ${className}`}>
      <span className="h-px flex-1 bg-gold/40" />
      <svg viewBox="0 0 80 24" className="h-5 w-20" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M40 12 Q30 4 16 6 Q22 10 30 12 Q22 14 16 18 Q30 20 40 12" />
        <path d="M40 12 Q50 4 64 6 Q58 10 50 12 Q58 14 64 18 Q50 20 40 12" />
        <circle cx="40" cy="12" r="1.4" fill="currentColor" />
      </svg>
      <span className="h-px flex-1 bg-gold/40" />
    </div>
  );
}

export function Owl({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M24 6 C14 6 8 14 8 24 C8 36 16 42 24 42 C32 42 40 36 40 24 C40 14 34 6 24 6 Z" />
      <circle cx="18" cy="22" r="5" />
      <circle cx="30" cy="22" r="5" />
      <circle cx="18" cy="22" r="1.5" fill="currentColor" />
      <circle cx="30" cy="22" r="1.5" fill="currentColor" />
      <path d="M22 28 L24 31 L26 28" />
    </svg>
  );
}

export function Roman({ n }: { n: number }) {
  const map: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let num = n; let out = "";
  for (const [v, s] of map) while (num >= v) { out += s; num -= v; }
  return <span className="roman">{out}</span>;
}
