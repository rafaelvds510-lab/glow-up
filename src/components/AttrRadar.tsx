import { ATTR_KEYS, ATTR_META, ATTR_MAX, type AttrKey } from "@/lib/identidade";

type Props = { attrs: Record<AttrKey, number>; size?: number };

export function AttrRadar({ attrs, size = 320 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 40;
  const n = ATTR_KEYS.length;

  const pointAt = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const ratio = value / ATTR_MAX;
    return [cx + Math.cos(angle) * r * ratio, cy + Math.sin(angle) * r * ratio] as const;
  };

  const ringPath = (ratio: number) =>
    ATTR_KEYS.map((_, i) => {
      const [x, y] = pointAt(i, ATTR_MAX * ratio);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ") + " Z";

  const dataPath = ATTR_KEYS.map((k, i) => {
    const [x, y] = pointAt(i, attrs[k] ?? 1);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-sm">
      {/* rings */}
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <path
          key={ratio}
          d={ringPath(ratio)}
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth={1}
        />
      ))}
      {/* axes */}
      {ATTR_KEYS.map((_, i) => {
        const [x, y] = pointAt(i, ATTR_MAX);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="currentColor"
            className="text-border"
            strokeWidth={1}
          />
        );
      })}
      {/* data */}
      <path
        d={dataPath}
        fill="color-mix(in oklab, var(--gold) 30%, transparent)"
        stroke="var(--gold)"
        strokeWidth={2}
      />
      {/* dots + labels */}
      {ATTR_KEYS.map((k, i) => {
        const [x, y] = pointAt(i, attrs[k] ?? 1);
        const [lx, ly] = pointAt(i, ATTR_MAX + 1.6);
        return (
          <g key={k}>
            <circle cx={x} cy={y} r={3} fill="var(--gold)" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-aegean font-display"
              style={{ fontSize: 13 }}
            >
              {ATTR_META[k].label}
            </text>
            <text
              x={lx}
              y={ly + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 10 }}
            >
              {attrs[k] ?? 1}/{ATTR_MAX}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
