/**
 * A laurel wreath, drawn rather than imported — there is no icon for it, and
 * it is the mark of every award without a photograph.
 *
 * Each branch is an arc up one side of a circle, from just off the bottom to
 * just short of the top, with pairs of leaves angled forward along it. The
 * right branch is the left one mirrored, leaving the wreath open at the top
 * and room in the middle for the year.
 */

const CENTER = 60;
const RADIUS = 46;
/* Degrees, measured the usual way (0 = right, 90 = up). */
const START = 258;
const END = 116;
const PAIRS = 6;

/** Rounded, so the server and the browser print identical numbers. */
const round = (n: number) => Math.round(n * 100) / 100;

function pointAt(degrees: number) {
  const t = (degrees * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(t),
    y: CENTER - RADIUS * Math.sin(t),
    /* Direction of travel up the left side, and the outward normal. */
    dx: Math.sin(t),
    dy: Math.cos(t),
    nx: Math.cos(t),
    ny: -Math.sin(t),
  };
}

type Leaf = { cx: number; cy: number; rx: number; ry: number; rotate: number };

function leaves(): Leaf[] {
  const result: Leaf[] = [];
  for (let i = 0; i < PAIRS; i++) {
    const degrees = START - 10 - (i * (START - END - 14)) / (PAIRS - 1);
    const p = pointAt(degrees);
    /* SVG rotation that turns an upright ellipse to face along the stem. */
    const along = (Math.atan2(p.dx, -p.dy) * 180) / Math.PI;
    const size = 1 - i * 0.07;
    for (const side of [1, -1] as const) {
      const length = (side === 1 ? 8.6 : 7) * size;
      result.push({
        cx: round(p.x + p.nx * 4.6 * side + p.dx * length * 0.55),
        cy: round(p.y + p.ny * 4.6 * side + p.dy * length * 0.55),
        rx: round((side === 1 ? 3.3 : 2.8) * size),
        ry: round(length),
        rotate: round(along - 34 * side),
      });
    }
  }
  /* One leaf finishing each branch, pointing on along the stem. */
  const tip = pointAt(END);
  result.push({
    cx: round(tip.x + tip.dx * 4),
    cy: round(tip.y + tip.dy * 4),
    rx: 2.6,
    ry: 6,
    rotate: round((Math.atan2(tip.dx, -tip.dy) * 180) / Math.PI),
  });
  return result;
}

const LEAVES = leaves();
const from = pointAt(START);
const to = pointAt(END);
const STEM = `M${round(from.x)} ${round(from.y)} A${RADIUS} ${RADIUS} 0 0 1 ${round(to.x)} ${round(to.y)}`;

export default function Laurel({ className }: { className?: string }) {
  const branch = (mirror: boolean) => (
    <g transform={mirror ? `translate(${CENTER * 2} 0) scale(-1 1)` : undefined}>
      <path d={STEM} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {LEAVES.map((leaf, i) => (
        <ellipse
          key={i}
          cx={leaf.cx}
          cy={leaf.cy}
          rx={leaf.rx}
          ry={leaf.ry}
          transform={`rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})`}
          fill="currentColor"
        />
      ))}
    </g>
  );

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      {branch(false)}
      {branch(true)}
    </svg>
  );
}
