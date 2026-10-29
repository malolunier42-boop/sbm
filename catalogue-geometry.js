import { createCatalogueRails } from "./catalogue-rails.js";

// These are visual studies from the catalogue, never manufacturing drawings.
// Keep the original bespoke viewer unchanged until an advanced choice is made.
const advancedDefaults = {
  structureType: "auto", quarterPosition: "middle", turnLayout: "balanced",
  going: 26, landingDepth: 90, diameter: 180, treadThickness: 40,
  handrail: "auto", railMaterial: "inox", railPattern: "standard",
  woodFinish: "natural", structureFinish: "natural", postColor: "#383d3a",
  startStep: "straight", nosing: "double-rounded", landingGuard: "none",
  antiSlip: "none", postCap: "flat", packDeco: false,
  balusterStyle: "plain", postStyle: "standard", slabTrim: "none",
};

// Physical bounds of this visual study, shared with the dimension guidance.
// Width/diameter/rise are in cm; tread thickness is in mm.
export function drawingMetrics(config) {
  const isSpiral = String(config.shape).startsWith("spiral");
  const diameter = Number(config.diameter ?? advancedDefaults.diameter);
  const requestedWidth = Number(config.width);
  const rise = Number(config.height) / Number(config.steps);
  const requestedTreadThickness = Number(config.treadThickness ?? advancedDefaults.treadThickness);
  const width = isSpiral ? Math.min(requestedWidth, Math.max(1, diameter / 2 - 8.5)) : requestedWidth;
  const treadThickness = Math.min(requestedTreadThickness, Math.max(5, rise * 10 - 5));
  return { isSpiral, diameter, requestedWidth, width, rise, requestedTreadThickness, treadThickness,
    widthLimited: width < requestedWidth, thicknessLimited: treadThickness < requestedTreadThickness };
}

export function usesCatalogueGeometry(configuration) {
  return (configuration.model && configuration.model !== "custom") ||
    configuration.shape === "spiral-square" ||
    Object.entries(advancedDefaults).filter(([key]) => !["woodFinish", "structureFinish", "postColor"].includes(key)).some(([key, value]) =>
      configuration[key] !== undefined && configuration[key] !== value);
}

export function buildCatalogueGeometry({ THREE, config: rawConfig, addMesh, materials }) {
  const config = { ...advancedDefaults, ...rawConfig };
  const metrics = drawingMetrics(config);
  const width = metrics.width / 100;
  const going = config.going / 100;
  const total = config.height / 100;
  const count = config.steps;
  const rise = total / count;
  const thickness = metrics.treadThickness / 1000;
  const base = 0.025;
  const steps = [];
  const flights = [];
  const turns = [];
  const landings = [];
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const isWood = !["steel", "aluminium", "stainless"].includes(config.structureMaterial);
  const support = config.structureType === "auto"
    ? (config.shape.startsWith("spiral") ? "post" : "limon")
    : config.structureType;
  const rails = createCatalogueRails({ THREE, addMesh, config, materials });
  const cross = (angle) => V(Math.cos(angle), 0, -Math.sin(angle));
  const forward = (angle) => V(Math.sin(angle), 0, Math.cos(angle));
  const solid = (geometry, material = materials.structure) => addMesh(geometry, material);
  const prism = (shape, depth, material, top, bevel = false) => {
    const bevelThickness = bevel ? Math.min(0.0025, depth / 10) : 0;
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: depth - bevelThickness * 2, bevelEnabled: bevel, bevelSize: Math.min(0.006, depth / 6),
      bevelThickness, bevelSegments: 2, curveSegments: 10,
    });
    geometry.rotateX(Math.PI / 2);
    const mesh = solid(geometry, material);
    mesh.position.y = top - bevelThickness;
    return mesh;
  };
  const box = (sx, sy, sz, center, material = materials.structure, angle = 0) => {
    const mesh = solid(new THREE.BoxGeometry(Math.max(0.003, sx), Math.max(0.003, sy), Math.max(0.003, sz)), material);
    mesh.position.copy(center);
    mesh.rotation.y = angle;
    return mesh;
  };
  const beam = (a, b, breadth, depth, material = materials.structure) => {
    if (a.distanceTo(b) < 0.001) return;
    const mesh = solid(new THREE.BoxGeometry(breadth, depth, a.distanceTo(b)), material);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(V(0, 0, 1), b.clone().sub(a).normalize());
    return mesh;
  };
  const cylinder = (a, b, radius, material = materials.inox) => {
    if (a.distanceTo(b) < 0.001) return;
    const mesh = solid(new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), 8), material);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
    return mesh;
  };
  const planeShape = (points) => {
    const shape = new THREE.Shape();
    points.forEach((p, i) => i ? shape.lineTo(p.x, p.z) : shape.moveTo(p.x, p.z));
    shape.closePath();
    return shape;
  };

  function addRect(x, z, angle, n, offset, depth = going) {
    if (n < 1) return;
    const across = cross(angle);
    const direction = forward(angle);
    const at = (distance, lateral, y) => V(x, y, z)
      .addScaledVector(direction, distance).addScaledVector(across, lateral);
    const flight = { x, z, angle, count: n, offset, depth, at };
    flights.push(flight);
    for (let i = 0; i < n; i += 1) {
      const index = offset + i;
      const top = base + (index + 1) * rise;
      const center = at(i * depth, 0, top);
      steps.push({ kind: "rect", index, top, center, angle, depth, at, distance: i * depth,
        left: at(i * depth, -width / 2, top), right: at(i * depth, width / 2, top) });
    }
  }

  function addTurn(cx, cz, from, to, n, offset, inner = 0, radius = width, square = true) {
    const turn = { cx, cz, from, to, count: n, offset, inner, radius, square, steps: [] };
    turns.push(turn);
    const radial = (angle, outside) => {
      const r = outside && square
        ? radius / Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)))
        : outside ? radius : inner;
      return V(cx + Math.cos(angle) * r, 0, cz + Math.sin(angle) * r);
    };
    for (let i = 0; i < n; i += 1) {
      const a = from + (to - from) * i / n;
      const b = from + (to - from) * (i + 1) / n;
      const m = (a + b) / 2;
      const index = offset + i;
      const top = base + (index + 1) * rise;
      const polygon = [radial(a, false)];
      for (let j = 0; j <= 7; j += 1) polygon.push(radial(a + (b - a) * j / 7, true));
      polygon.push(radial(b, false));
      const outer = radial(m, true).setY(top);
      const inset = radial(m, false).setY(top);
      const center = outer.clone().lerp(inset, 0.5);
      const step = { kind: "turn", index, top, center, polygon, angle: Math.PI - m,
        left: outer, right: inset, turn, a, b };
      steps.push(step);
      turn.steps.push(step);
    }
    return turn;
  }

  if (config.shape === "spiral" || config.shape === "spiral-square") {
    const radius = config.diameter / 200;
    const inner = Math.max(0.085, radius - width);
    addTurn(0, 0, -Math.PI * 0.88, -Math.PI * 0.88 - Math.PI * 1.88,
      count, 0, inner, radius, config.shape === "spiral-square");
  } else if (config.shape === "straight") {
    addRect(0, 0, 0, count, 0);
  } else if (config.shape === "quarter") {
    if (config.turnLayout === "landing") {
      const first = config.quarterPosition === "low" ? 3 : config.quarterPosition === "high" ? count - 3 : Math.ceil(count / 2);
      addRect(0, 0, 0, first, 0);
      const d = Math.max(width, config.landingDepth / 100);
      const edge = (first - 0.5) * going;
      landings.push({ center: V(0, base + first * rise, edge + d / 2), width, depth: d });
      addRect(width / 2 + going / 2, edge + d - width / 2, Math.PI / 2, count - first, first);
    } else {
      const winders = Math.min(4, Math.max(3, Math.round(width / going)));
      const remaining = count - winders;
      const first = Math.max(1, Math.min(remaining - 1, config.quarterPosition === "low" ? 2 : config.quarterPosition === "high" ? remaining - 2 : Math.ceil(remaining / 2)));
      const edge = (first - 0.5) * going;
      addRect(0, 0, 0, first, 0);
      addTurn(width / 2, edge, Math.PI, Math.PI / 2, winders, first);
      addRect(width / 2 + going / 2, edge + width / 2, Math.PI / 2, remaining - first, first + winders);
    }
  } else {
    const gap = config.turnLayout === "square-well" ? width * 0.88 : config.turnLayout === "stacked" ? 0.045 : 0.18;
    const side = (width + gap) / 2;
    if (config.turnLayout === "landing") {
      const first = Math.ceil(count / 2);
      const edge = (first - 0.5) * going;
      const d = config.landingDepth / 100;
      addRect(-side, 0, 0, first, 0);
      landings.push({ center: V(0, base + first * rise, edge + d / 2), width: width * 2 + gap, depth: d });
      addRect(side, (first - 1) * going, Math.PI, count - first, first);
    } else {
      const bridgeSteps = Math.min(count - 4, Math.max(1, Math.round(gap / going)));
      const turnSteps = Math.min(config.turnLayout === "stacked" ? 2 : 3,
        Math.max(1, Math.floor((count - bridgeSteps - 2) / 2)));
      const first = Math.max(1, Math.ceil((count - turnSteps * 2 - bridgeSteps) / 2));
      const second = count - first - turnSteps * 2 - bridgeSteps;
      const cx = -side + width / 2;
      const edge = (first - 0.5) * going;
      addRect(-side, 0, 0, first, 0);
      addTurn(cx, edge, Math.PI, Math.PI / 2, turnSteps, first);
      addRect(cx + gap / bridgeSteps / 2, edge + width / 2, Math.PI / 2,
        bridgeSteps, first + turnSteps, gap / bridgeSteps);
      addTurn(cx + gap, edge, Math.PI / 2, 0, turnSteps, first + turnSteps + bridgeSteps);
      addRect(side, edge - going / 2, Math.PI, second, first + turnSteps * 2 + bridgeSteps);
    }
  }
  steps.sort((a, b) => a.index - b.index);

  // Tread profiles are genuine solids. The first one/two steps can be widened
  // and curved independently from the flight's structural members.
  for (const step of steps) {
    let mesh;
    if (step.kind === "turn") {
      mesh = prism(planeShape(step.polygon), thickness, materials.tread, step.top, config.nosing === "double-rounded");
    } else {
      let w = width;
      let d = step.depth + (config.nosing === "none" ? -0.012 : 0.025);
      const doubleStart = ["double", "double-projecting", "double-rounded", "curved"].includes(config.startStep);
      const featured = step.index === 0 || (step.index === 1 && doubleStart);
      if (featured && config.startStep !== "straight") {
        const projecting = ["projecting", "double-projecting"].includes(config.startStep);
        const frontPost = ["front-post", "double"].includes(config.startStep);
        w *= frontPost ? 1 : projecting ? (step.index === 0 ? 1.16 : 1.10) : (step.index === 0 ? 1.28 : 1.12);
        d += frontPost ? 0.055 : step.index === 0 ? 0.08 : 0.035;
      }
      const shape = new THREE.Shape();
      const curved = featured && ["rounded", "curved", "double-rounded"].includes(config.startStep);
      const galbe = config.startStep === "curved";
      shape.moveTo(-w / 2, -d / 2 + (curved ? 0.08 : 0));
      if (curved) {
        // Arrondie has a soft full-width bow; galbée adds swept, rounded ends.
        shape.bezierCurveTo(-w / 2 - (galbe ? 0.09 : 0.02), -d / 2 - 0.11,
          w / 2 + (galbe ? 0.09 : 0.02), -d / 2 - 0.11, w / 2, -d / 2 + 0.08);
      }
      else shape.lineTo(w / 2, -d / 2);
      shape.lineTo(w / 2, d / 2);
      shape.lineTo(-w / 2, d / 2);
      shape.closePath();
      mesh = prism(shape, thickness, materials.tread, step.top, ["double-rounded", "under-rounded"].includes(config.nosing));
      mesh.position.x = step.center.x;
      mesh.position.z = step.center.z;
      mesh.rotation.y = step.angle;
      const at = (distance, lateral, y) => step.at(step.distance + distance, lateral, y);
      if (config.nosing === "beak") {
        const lip = box(w, thickness * 0.65, 0.026, at(-d / 2, 0, step.top - thickness * 0.7), materials.tread, step.angle);
        lip.userData.detail = "bec-de-corbin";
      }
      if (config.nosing === "under-rounded") {
        const under = cylinder(at(-d / 2 + 0.012, -w / 2, step.top - thickness + 0.008),
          at(-d / 2 + 0.012, w / 2, step.top - thickness + 0.008), 0.012, materials.tread);
        if (under) under.userData.detail = "arrondi-dessous";
      }
      if (config.antiSlip !== "none") {
        const strips = config.antiSlip === "grooves" ? [0.025, 0.045, 0.065] : [0.04];
        strips.forEach((distance) => box(w * 0.84, 0.0025,
          config.antiSlip === "grooves" ? 0.003 : 0.022,
          at(-d / 2 + distance, 0, step.top + 0.002), materials.inox, step.angle));
      }
      if (config.risers) {
        box(width - 0.008, rise - thickness + 0.005, 0.022,
          at(-step.depth / 2 + 0.01, 0, step.top - thickness - (rise - thickness) / 2),
          config.structureFinish === "painted" ? materials.structure : materials.tread, step.angle);
      }
      if (config.led) {
        const led = box(w * 0.84, 0.009, 0.012, at(-d / 2 + 0.008, 0, step.top - thickness + 0.004), materials.led, step.angle);
        led.castShadow = false;
      }
    }
    mesh.userData.kind = "catalogue-tread";
    mesh.userData.step = step.index;
    if (step.kind === "turn" && config.risers) {
      const from = step.polygon[0].clone().setY(step.top - rise / 2);
      const to = step.polygon[1].clone().setY(step.top - rise / 2);
      beam(from, to, 0.022, Math.max(0.03, rise - thickness), materials.structure);
    }
    if (step.kind === "turn" && config.led) {
      const from = step.polygon[0].clone().setY(step.top - thickness + 0.005);
      const to = step.polygon[1].clone().setY(step.top - thickness + 0.005);
      cylinder(from, to, 0.006, materials.led);
    }
    if (step.kind === "turn" && (config.antiSlip !== "none" || config.nosing === "under-rounded")) {
      const { turn } = step;
      const radialLine = (fraction, y, radius, material) => {
        const angle = step.a + (step.b - step.a) * fraction;
        const outer = turn.square ? turn.radius / Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle))) : turn.radius;
        cylinder(V(turn.cx + Math.cos(angle) * (turn.inner + 0.07), y, turn.cz + Math.sin(angle) * (turn.inner + 0.07)),
          V(turn.cx + Math.cos(angle) * (outer - 0.06), y, turn.cz + Math.sin(angle) * (outer - 0.06)), radius, material);
      };
      if (config.antiSlip !== "none") {
        (config.antiSlip === "grooves" ? [0.12, 0.18, 0.24] : [0.16])
          .forEach((fraction) => radialLine(fraction, step.top + 0.003,
            config.antiSlip === "grooves" ? 0.002 : 0.008, materials.inox));
      }
      if (config.nosing === "under-rounded") radialLine(0.015, step.top - thickness + 0.008, 0.012, materials.tread);
    }
  }

  const profile = (flight, side, stepped = false, breadth = 0.05, depth = 0.25) => {
    const { at, count: n, depth: g, offset, angle } = flight;
    const shape = new THREE.Shape();
    const firstTop = base + (offset + 1) * rise - thickness;
    const lastTop = base + (offset + n) * rise - thickness;
    const start = -g / 2;
    const end = (n - 0.5) * g;
    if (stepped) {
      shape.moveTo(start, firstTop);
      for (let i = 0; i < n; i += 1) {
        const top = firstTop + i * rise;
        shape.lineTo((i + 0.5) * g, top);
        if (i < n - 1) shape.lineTo((i + 0.5) * g, top + rise);
      }
    } else {
      shape.moveTo(start, firstTop + rise * 0.45);
      shape.lineTo(end, lastTop + rise * 0.45);
    }
    shape.lineTo(end, lastTop - depth);
    shape.lineTo(start, offset === 0 ? Math.max(base, firstTop - depth) : firstTop - depth);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: breadth, bevelEnabled: false, curveSegments: 1 });
    // Extruded profile: local x=run,y=height,z=thickness -> flight coordinates.
    const pos = geometry.attributes.position;
    const point = V();
    for (let i = 0; i < pos.count; i += 1) {
      // x(run), y(up), -z(across) preserve the extrusion's outward winding.
      point.copy(at(pos.getX(i), side + breadth / 2 - pos.getZ(i), pos.getY(i)));
      pos.setXYZ(i, point.x, point.y, point.z);
    }
    geometry.computeVertexNormals();
    const mesh = solid(geometry);
    mesh.userData.structure = support;
    return mesh;
  };

  for (const flight of flights) {
    const n = flight.count;
    const fromY = base + (flight.offset + 0.65) * rise - thickness - 0.06;
    const toY = base + (flight.offset + n + 0.65) * rise - thickness - 0.06;
    const length = n * flight.depth;
    const at = flight.at;
    if (["limon", "metal-limon", "wall"].includes(support)) {
      for (const side of [-1, 1]) profile(flight, side * width * 0.49, false, isWood ? 0.055 : 0.017, support === "wall" ? 0.19 : 0.24);
    } else if (["cut", "metal-cut"].includes(support)) {
      for (const side of [-1, 1]) profile(flight, side * width * 0.46, true, isWood ? 0.055 : 0.017, 0.19);
    } else if (support === "offset") {
      profile(flight, -width * 0.43, true, 0.07, 0.22);
      profile(flight, width * 0.485, false, 0.035, 0.14);
    } else if (["double", "metal-double"].includes(support)) {
      for (const side of [-1, 1]) profile(flight, side * width * 0.17, true, support === "double" ? 0.075 : 0.018, 0.23);
      if (support === "metal-double") for (let i = 0; i < n; i += 1) {
        const y = base + (flight.offset + i + 1) * rise - thickness - 0.045;
        cylinder(at(i * flight.depth, -width * 0.38, y), at(i * flight.depth, width * 0.38, y), 0.02);
      }
    } else {
      const a = at(-flight.depth / 2, 0, fromY - 0.10);
      const b = at(length - flight.depth / 2, 0, toY - 0.10);
      if (support === "central-wood") {
        // The open end of the box girder reveals the hollow core (CCAC).
        for (const side of [-1, 1]) beam(a.clone().addScaledVector(cross(flight.angle), side * 0.14), b.clone().addScaledVector(cross(flight.angle), side * 0.14), 0.035, 0.32);
        beam(a.clone().add(V(0, 0.145, 0)), b.clone().add(V(0, 0.145, 0)), 0.30, 0.03);
        beam(a.clone().add(V(0, -0.145, 0)), b.clone().add(V(0, -0.145, 0)), 0.30, 0.03);
      } else beam(a, b, support === "metal-central" ? 0.16 : 0.20, 0.27);
      for (let i = 0; i < n; i += 1) box(width * 0.68, 0.025, flight.depth * 0.60,
        at(i * flight.depth, 0, base + (flight.offset + i + 1) * rise - thickness - 0.03), materials.structure, flight.angle);
    }
    if (flight.offset === 0) for (const lateral of support.includes("central") ? [-0.10, 0.10] : [-width * 0.38, width * 0.38]) {
      box(0.16, 0.025, 0.20, at(-flight.depth * 0.23, lateral, 0.032));
    }
    if (config.packDeco && flight.offset === 0) {
      const y = base + Math.max(1, Math.floor(n / 3)) * rise;
      box(0.009, 0.055, 0.18, at(Math.max(0, Math.floor(n / 3) - 1) * flight.depth, -width * 0.52, y), materials.inox, flight.angle);
    }
    if (support === "wall" || config.handrail.startsWith("wall-")) {
      // Translucent cutaway partitions keep the enclosed stair readable from
      // either side without pretending the visitor's room has been measured.
      const wall = box(0.055, 1.24, length + 0.08,
        at(length / 2 - flight.depth / 2, width * 0.57, (fromY + toY) / 2 + 0.38), materials.wall, flight.angle);
      wall.userData.kind = "enclosure-cutaway";
      wall.castShadow = false;
    }
    for (const side of config.handrail.startsWith("wall-") ? [1] : [-1, 1]) {
      const points = [];
      for (let i = 0; i <= n; i += 1) points.push(at(i * flight.depth - flight.depth / 2,
        side * (width / 2 - 0.025), base + (flight.offset + i + 0.5) * rise));
      rails.ramp(points);
    }
  }

  for (const turn of turns) {
    const { cx, cz, inner, radius, count: n, from, to } = turn;
    if (config.shape.startsWith("spiral")) {
      const mast = solid(new THREE.CylinderGeometry(0.065, 0.09, total + 0.12, 24), config.model === "kit-carre" ? materials.inox : materials.structure);
      mast.position.set(cx, (total + 0.12) / 2, cz);
      box(0.25, 0.035, 0.25, V(cx, 0.032, cz), materials.inox);
    }
    const outer = turn.steps.map((step) => step.left.clone());
    const inset = turn.steps.map((step) => step.right.clone());
    const offsets = support === "double" || support === "metal-double" ? [0.33, 0.66]
      : ["central-wood", "metal-central", "post"].includes(support) ? [0.5] : [0.06, 0.94];
    for (const fraction of offsets) {
      const endpoint = (angle, index) => {
        const outside = turn.square ? radius / Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle))) : radius;
        const r = outside * (1 - fraction) + inner * fraction;
        return V(cx + Math.cos(angle) * r, base + (turn.offset + index + 0.5) * rise - thickness - 0.12,
          cz + Math.sin(angle) * r);
      };
      const points = [endpoint(from, 0), ...outer.map((point, i) =>
        point.clone().lerp(inset[i], fraction).add(V(0, -thickness - 0.12, 0))), endpoint(to, n)];
      for (let i = 0; i < points.length - 1; i += 1) {
        const a = points[i];
        const b = points[i + 1];
        beam(a, b, support === "central-wood" ? 0.22 : isWood ? 0.065 : 0.022, 0.22);
      }
    }
    if (config.shape.startsWith("spiral")) for (const step of turn.steps) {
      const end = step.center.clone().setY(step.top - thickness - 0.025);
      cylinder(V(cx, step.top - thickness - 0.025, cz), end, 0.027,
        support === "post" ? materials.inox : materials.structure);
    }
    const extend = (points, outside) => {
      if (points.length < 2) return points;
      const position = (angle, index) => {
        const r = outside && turn.square ? radius / Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle))) : outside ? radius : inner;
        return V(cx + Math.cos(angle) * r, base + (turn.offset + index + 0.5) * rise, cz + Math.sin(angle) * r);
      };
      return [position(from, 0), ...points, position(to, n)];
    };
    rails.ramp(extend(outer, true));
    if (inner > 0.22 && !config.shape.startsWith("spiral")) rails.ramp(extend(inset, false));
  }

  function addLanding(landing, arrival = false) {
    const { center, width: w, depth: d, angle = 0 } = landing;
    box(w, thickness, d, center.clone().add(V(0, -thickness / 2, 0)), materials.tread, angle);
    box(w - 0.04, 0.10, d - 0.04, center.clone().add(V(0, -thickness - 0.04, 0)));
    if (arrival && config.model === "outdoor") for (const side of [-1, 1]) {
      beam(center.clone().add(V(side * w * 0.40, -0.15, -d * 0.28)),
        center.clone().add(V(side * w * 0.40, -Math.min(total * 0.55, 1.2), d * 0.35)), 0.075, 0.10);
    }
    const across = cross(angle);
    const front = forward(angle);
    const at = (x, z) => center.clone().addScaledVector(across, x).addScaledVector(front, z);
    if (arrival && config.slabTrim !== "none") {
      const style = config.slabTrim;
      const metallic = ["metal", "inox"].includes(style);
      const material = style === "inox" ? materials.inox : style === "metal" ? materials.trimMetal ?? materials.structure
        : style === "painted" ? materials.trimPainted ?? materials.structure
          : style === "plywood" ? materials.plywood ?? materials.tread : materials.tread;
      const height = metallic ? 0.12 : ["plywood", "painted"].includes(style) ? 0.33 : 0.08;
      const gauge = metallic ? 0.005 : style === "wood" ? 0.028 : 0.018;
      // The two sides and outer edge receive a real fascia; the stair entrance stays open.
      const trims = [
        { x: -w / 2 - gauge / 2, z: 0, w: gauge, d },
        { x: w / 2 + gauge / 2, z: 0, w: gauge, d },
        { x: 0, z: d / 2 + gauge / 2, w: w + gauge * 2, d: gauge },
      ];
      for (const edge of trims) {
        const fascia = box(edge.w, height, edge.d, at(edge.x, edge.z).add(V(0, -height / 2, 0)), material, angle);
        fascia.userData.detail = `slab-trim-${style}`;
        if (metallic || ["wood", "plywood"].includes(style)) {
          const lip = metallic ? 0.035 : 0.045;
          box(edge.w === gauge ? lip : edge.w, metallic ? gauge : 0.014,
            edge.d === gauge ? lip : edge.d, at(edge.x, edge.z).add(V(0, 0.003, 0)),
            style === "plywood" ? materials.tread : material, angle);
        }
      }
    }
    const edges = [
      [at(-w / 2 + 0.025, -d / 2), at(-w / 2 + 0.025, d / 2)],
      [at(-w / 2 + 0.025, d / 2 - 0.025), at(w / 2 - 0.025, d / 2 - 0.025)],
    ];
    // Keep the approach and the visitor's exit open.
    for (const points of edges) arrival ? rails.landing(points) : rails.ramp(points);
  }
  landings.forEach((landing) => addLanding(landing));
  if ((config.landingGuard !== "none" || config.slabTrim !== "none") && steps.length) {
    const last = steps.at(-1);
    let heading = last.angle;
    let destination = last.center.clone();
    if (last.kind === "turn") {
      const angle = last.b;
      heading = Math.PI - angle;
      const r = (last.turn.radius + last.turn.inner) / 2;
      destination.set(last.turn.cx + Math.cos(angle) * r, last.top, last.turn.cz + Math.sin(angle) * r);
    }
    const d = config.landingDepth / 100;
    destination.addScaledVector(forward(heading), (last.depth || going) / 2 + d / 2);
    addLanding({ center: destination, width: width * 1.4, depth: d, angle: heading }, true);
  }
  return { stepCount: steps.length, structureType: support, model: config.model, quarterPosition: config.quarterPosition,
    turnLayout: config.turnLayout, treadThickness: metrics.treadThickness, dimensions: metrics };
}
