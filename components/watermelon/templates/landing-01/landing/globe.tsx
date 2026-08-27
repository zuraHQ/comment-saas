// Points spread evenly over a real sphere, then projected with perspective:
// depth does the work, so there is no outline drawn anywhere. Built once at
// module load so the server and the client render the same markup.
const SIZE = 400;
const CENTER = SIZE / 2;
const RADIUS = 168;
const COUNT = 520;
const TILT = -0.42; // radians, tips the pole toward the viewer
const CAMERA = 2.9; // distance in sphere radii; smaller is more perspective

type Node = {
  x: number;
  y: number;
  z: number; // -1 back, 1 front
  size: number;
  lit: boolean;
};

function buildMesh() {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const points: Array<[number, number, number]> = [];

  // Fibonacci sphere: even coverage without clumping at the poles.
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push([Math.cos(theta) * ring, y, Math.sin(theta) * ring]);
  }

  const cos = Math.cos(TILT);
  const sin = Math.sin(TILT);

  const nodes: Node[] = points.map(([x, y0, z0], i) => {
    const y = y0 * cos - z0 * sin;
    const z = y0 * sin + z0 * cos;
    const scale = CAMERA / (CAMERA - z);
    return {
      x: CENTER + x * RADIUS * scale,
      y: CENTER - y * RADIUS * scale,
      z,
      size: 1.4 + (z + 1) * 1.15,
      lit: i % 17 === 0,
    };
  });

  // Wire neighbours in 3D, so the mesh wraps the surface instead of stitching
  // across the silhouette.
  const edges: Array<{ a: Node; b: Node; z: number }> = [];
  const near = 4.2 / Math.sqrt(COUNT);
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i][0] - points[j][0];
      const dy = points[i][1] - points[j][1];
      const dz = points[i][2] - points[j][2];
      if (dx * dx + dy * dy + dz * dz > near * near) continue;
      edges.push({
        a: nodes[i],
        b: nodes[j],
        z: (nodes[i].z + nodes[j].z) / 2,
      });
    }
  }

  // Paint back to front so the near face sits on top.
  nodes.sort((a, b) => a.z - b.z);
  edges.sort((a, b) => a.z - b.z);
  return { nodes, edges };
}

const { nodes: NODES, edges: EDGES } = buildMesh();

const depth = (z: number) => (z + 1) / 2; // 0 at the back, 1 at the front

export default function Globe({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      aria-hidden="true"
      fill="none"
      shapeRendering="crispEdges"
    >
      {EDGES.map((edge, i) => (
        <line
          key={`e-${i}`}
          x1={edge.a.x}
          y1={edge.a.y}
          x2={edge.b.x}
          y2={edge.b.y}
          stroke="#ffffff"
          strokeOpacity={0.02 + depth(edge.z) * 0.1}
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
          opacity={
            node.lit
              ? 0.25 + depth(node.z) * 0.65
              : 0.08 + depth(node.z) * 0.55
          }
        />
      ))}
    </svg>
  );
}
