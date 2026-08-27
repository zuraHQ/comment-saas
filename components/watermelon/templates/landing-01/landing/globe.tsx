// A wireframe globe for the hero background: transparent, no fill, just the
// graticule and a scatter of nodes so it reads as "the whole internet".
const LATITUDES = [-140, -100, -55, 0, 55, 100, 140];
const LONGITUDES = [180, 148, 100, 40];

// Points sit on the sphere's silhouette maths so they land on the surface
// rather than floating over it: [x offset, y offset, radius].
const NODES: Array<[number, number, number]> = [
  [-118, -92, 2.5],
  [-52, -138, 2],
  [34, -118, 3],
  [126, -74, 2],
  [-152, -18, 2],
  [-76, -30, 3.5],
  [22, -44, 2],
  [96, 6, 2.5],
  [162, 40, 2],
  [-134, 62, 2.5],
  [-40, 78, 3],
  [58, 96, 2],
  [118, 118, 2.5],
  [-8, 152, 2],
];

export default function Globe({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="200" cy="200" r="180" stroke="rgba(255,255,255,0.14)" />

      {LATITUDES.map((dy) => {
        const rx = Math.sqrt(180 * 180 - dy * dy);
        return (
          <ellipse
            key={`lat-${dy}`}
            cx="200"
            cy={200 + dy}
            rx={rx}
            ry={rx * 0.24}
            stroke="rgba(255,255,255,0.08)"
          />
        );
      })}

      {LONGITUDES.map((rx) => (
        <ellipse
          key={`lon-${rx}`}
          cx="200"
          cy="200"
          rx={rx}
          ry="180"
          stroke="rgba(255,255,255,0.08)"
        />
      ))}
      <line
        x1="200"
        y1="20"
        x2="200"
        y2="380"
        stroke="rgba(255,255,255,0.08)"
      />

      {NODES.map(([dx, dy, r], i) => (
        <circle
          key={i}
          cx={200 + dx}
          cy={200 + dy}
          r={r}
          fill="#A3FF12"
          opacity={0.55}
        />
      ))}
    </svg>
  );
}
