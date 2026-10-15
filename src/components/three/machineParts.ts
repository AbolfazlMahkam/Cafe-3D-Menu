import * as THREE from "three";

/**
 * The imported espresso machine is a single scanned mesh that actually contains
 * dozens of disconnected shells (body, drip tray, group head, wand, knobs...).
 * Splitting it into those islands lets each physical component take its own
 * material so the machine reads as a real appliance rather than one blob.
 *
 * Islands are found by welding coincident vertices and union-finding every
 * triangle; the result is independent of index/vertex ordering.
 */
export function splitComponents(geometry: THREE.BufferGeometry): THREE.BufferGeometry[] {
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const index = geometry.getIndex();
  const count = position.count;
  const idx = index ? (index.array as ArrayLike<number>) : null;
  const triCount = idx ? Math.floor(idx.length / 3) : Math.floor(count / 3);
  const vertAt = (tri: number, corner: number) => (idx ? idx[tri * 3 + corner] : tri * 3 + corner);

  // Weld vertices that share a position (the export splits verts on UV seams).
  const precision = 1e4;
  const welded = new Map<string, number>();
  const rep = new Int32Array(count);
  for (let i = 0; i < count; i += 1) {
    const key = `${Math.round(position.getX(i) * precision)},${Math.round(
      position.getY(i) * precision,
    )},${Math.round(position.getZ(i) * precision)}`;
    let root = welded.get(key);
    if (root === undefined) {
      root = i;
      welded.set(key, root);
    }
    rep[i] = root;
  }

  const parent = new Int32Array(count);
  for (let i = 0; i < count; i += 1) parent[i] = i;
  const find = (x: number): number => {
    let root = x;
    while (parent[root] !== root) root = parent[root];
    while (parent[x] !== root) {
      const next = parent[x];
      parent[x] = root;
      x = next;
    }
    return root;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };

  for (let t = 0; t < triCount; t += 1) {
    union(rep[vertAt(t, 0)], rep[vertAt(t, 1)]);
    union(rep[vertAt(t, 1)], rep[vertAt(t, 2)]);
  }

  const islands = new Map<number, number[]>();
  for (let t = 0; t < triCount; t += 1) {
    const root = find(rep[vertAt(t, 0)]);
    let list = islands.get(root);
    if (!list) {
      list = [];
      islands.set(root, list);
    }
    list.push(vertAt(t, 0), vertAt(t, 1), vertAt(t, 2));
  }

  const attributes = Object.keys(geometry.attributes);
  const out: THREE.BufferGeometry[] = [];
  for (const list of islands.values()) {
    const remap = new Map<number, number>();
    const triangles: number[] = [];
    for (const vertex of list) {
      let mapped = remap.get(vertex);
      if (mapped === undefined) {
        mapped = remap.size;
        remap.set(vertex, mapped);
      }
      triangles.push(mapped);
    }

    const part = new THREE.BufferGeometry();
    for (const name of attributes) {
      const attr = geometry.getAttribute(name) as THREE.BufferAttribute;
      const itemSize = attr.itemSize;
      const values = new Float32Array(remap.size * itemSize);
      for (const [source, target] of remap) {
        for (let c = 0; c < itemSize; c += 1) {
          values[target * itemSize + c] = attr.array[source * itemSize + c];
        }
      }
      part.setAttribute(name, new THREE.BufferAttribute(values, itemSize));
    }
    part.setIndex(triangles);
    part.computeBoundingBox();
    part.computeBoundingSphere();
    out.push(part);
  }

  return out;
}
