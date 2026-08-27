// Not a literal globe: a round mesh of pixels wired to their neighbours, so it
// reads as a network rather than a planet. Built once at module load from a
// seeded generator, so the server and the client draw the same thing.
const SIZE = 400;
const CENTER = SIZE / 2;
const RADIUS = 186;
const STEP = 17;

// Small deterministic LCG. Math.random would desync hydration.
function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

type Node = { x: number; y: number; size: number; lit: boolean; opacity: number };

function buildMesh() {
  const random = makeRandom(20260827);
  const nodes: Node[] = [];

  for (let y = CENTER - RADIUS; y <= CENTER + RADIUS; y += STEP) {
    for (let x = CENTER - RADIUS; x <= CENTER + RADIUS; x += STEP) {
      const jx = x + (random() - 0.5) * STEP * 0.7;
      const jy = y + (random() - 0.5) * STEP * 0.7;
      const dist = Math.hypot(jx - CENTER, jy - CENTER);
      if (dist > RADIUS) continue;

      // Thin the middle out and crowd the rim, the way a sphere's surface
      // bunches up as it turns away from you.
      const edge = dist / RADIUS;
      if (random() > 0.35 + edge * 0.6) continue;

      nodes.push({
        x: jx,
        y: jy,
        size: random() > 0.88 ? 3 : 2,
        lit: random() > 0.9,
        opacity: 0.18 + edge * 0.35,
      });
    }
  }

  // Wire each pixel to whatever is close enough to feel connected.
  const edges: Array<[Node, Node]> = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < STEP * 1.5) {
        edges.push([nodes[i], nodes[j]]);
      }
    }
  }

  return { nodes, edges };
}

const { nodes: NODES, edges: EDGES } = buildMesh();

export default function Globe({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      aria-hidden="true"
      fill="none"
      shapeRendering="crispEdges"
    >
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS + 6}
        stroke="rgba(255,255,255,0.10)"
      />

      {EDGES.map(([a, b], i) => (
        <line
          key={`e-${i}`}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="rgba(255,255,255,0.07)"
        />
      ))}

      {NODES.map((node, i) => (
        <rect
          key={`n-${i}`}
          x={node.x - node.size / 2}
          y={node.y - node.size / 2}
          width={node.size}
          height={node.size}
          fill={node.lit ? "#A3FF12" : "#ffffff"}
          opacity={node.lit ? 0.75 : node.opacity}
        />
      ))}
    </svg>
  );
}
