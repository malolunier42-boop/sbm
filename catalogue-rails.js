// Parametric guards are visual studies based on the Riaux catalogue. Their
// dimensions and fixing details do not replace an execution drawing.
export function createCatalogueRails({ THREE, addMesh, config, materials }) {
  const m = {
    structure: materials.structure,
    tread: materials.tread ?? materials.structure,
    handrail: materials.handrail ?? materials.tread ?? materials.structure,
    rail: materials.rail ?? materials.structure,
    inox: materials.inox ?? materials.rail ?? materials.structure,
    glass: materials.glass ?? materials.rail ?? materials.structure,
    post: materials.post ?? materials.structure,
    wood: materials.tread ?? materials.structure,
    brass: materials.brass ?? materials.inox ?? materials.structure,
  };
  const up = new THREE.Vector3(0, 1, 0);
  const atHeight = (point, height) => point.clone().addScaledVector(up, height);
  const finitePoints = (points) => {
    const result = [];
    for (const point of points) {
      if (point && [point.x, point.y, point.z].every(Number.isFinite)
        && (!result.length || point.distanceToSquared(result.at(-1)) > 1e-8))
        result.push(point);
    }
    return result;
  };

  function bar(from, to, radius = 0.009, material = m.rail, sides = 8) {
    const direction = to.clone().sub(from);
    const length = direction.length();
    if (length < 1e-5) return undefined;
    const mesh = addMesh(new THREE.CylinderGeometry(radius, radius, length, sides), material);
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(up, direction.divideScalar(length));
    return mesh;
  }

  function flatBar(from, to, width, height, material = m.handrail) {
    const direction = to.clone().sub(from);
    const length = direction.length();
    if (length < 1e-5) return undefined;
    const mesh = addMesh(new THREE.BoxGeometry(width, height, length + 0.008), material);
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction.divideScalar(length));
    return mesh;
  }

  function route(points) {
    const clean = finitePoints(points);
    if (clean.length < 2) return undefined;
    const curve = new THREE.CatmullRomCurve3(clean, false, 'centripetal');
    const length = curve.getLength();
    return { curve, length, point: (t) => curve.getPointAt(Math.max(0, Math.min(1, t))) };
  }

  function roundRail(path, height, radius, material = m.handrail) {
    const points = path.curve.getSpacedPoints(Math.max(8, Math.ceil(path.length / 0.09)))
      .map((point) => atHeight(point, height));
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
    return addMesh(new THREE.TubeGeometry(curve,
      Math.min(180, Math.max(12, Math.ceil(path.length / 0.045))), radius, 8, false), material);
  }

  function handrail(path, height = 0.98) {
    const type = config.handrail ?? 'auto';
    if (['rect-wood', 'wall-rect-wood', 'flat-metal', 'wall-metal'].includes(type)) {
      const wooden = type.includes('wood');
      const count = Math.max(1, Math.ceil(path.length / 0.28));
      for (let i = 0; i < count; i += 1) {
        const start = atHeight(path.point(i / count), height);
        const end = atHeight(path.point((i + 1) / count), height);
        flatBar(start, end, wooden ? 0.068 : 0.014, wooden ? 0.048 : 0.055);
      }
    } else if (type === 'english-wood') {
      roundRail(path, height + 0.013, 0.033);
      const count = Math.max(1, Math.ceil(path.length / 0.3));
      for (let i = 0; i < count; i += 1)
        flatBar(atHeight(path.point(i / count), height - 0.025),
          atHeight(path.point((i + 1) / count), height - 0.025), 0.052, 0.025);
    } else {
      const metal = ['round-metal', 'round-inox', 'wall-round-metal', 'wall-inox'].includes(type);
      roundRail(path, height, metal ? 0.022 : 0.029,
        ['round-inox', 'wall-inox'].includes(type) ? m.inox : m.handrail);
    }
  }

  const geometryCache = new Map();
  const cached = (key, make) => {
    if (!geometryCache.has(key)) geometryCache.set(key, make());
    return geometryCache.get(key);
  };
  function lathe(profile, height, radius, material, point, key) {
    const geometry = cached(`${key}:${height}:${radius}`, () => new THREE.LatheGeometry(
      profile.map(([y, r]) => new THREE.Vector2(r * radius, y * height)), 12));
    const mesh = addMesh(geometry, material);
    mesh.position.copy(point);
    return mesh;
  }
  function collar(point, height, radius, material, gauge = 0.005) {
    const geometry = cached(`collar:${radius}:${gauge}`, () => new THREE.TorusGeometry(radius, gauge, 5, 12));
    const mesh = addMesh(geometry, material);
    mesh.position.copy(atHeight(point, height));
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  }

  function cap(point, height, isWood, material = m.post, tangent = new THREE.Vector3(1, 0, 0)) {
    const style = config.postCap ?? 'flat';
    if (style === 'flat') return;
    const size = isWood ? 0.048 : 0.034;
    const center = atHeight(point, height + 0.018);
    let geometry;
    if (style === 'ball' || style === 'brass-ball') {
      bar(atHeight(point, height), atHeight(point, height + 0.04), size * 0.42, style === 'brass-ball' ? m.brass : material);
      geometry = new THREE.SphereGeometry(size, 12, 10);
      center.y += size + 0.018;
    } else if (style === 'acorn') {
      const mesh = lathe([[0, 0], [0.04, 0.55], [0.12, 0.8], [0.25, 0.65], [0.38, 0.92],
        [0.6, 1], [0.82, 0.67], [1, 0]], 0.13, size, material,
      atHeight(point, height), 'cap-acorn');
      collar(point, height + 0.021, size * 0.77, material, 0.004);
      return mesh;
    } else if (['diamond', 'diamond-chamfer', 'chamfer'].includes(style)) {
      const r = (isWood ? 0.075 : 0.05) / Math.sqrt(2);
      const h = style === 'chamfer' ? 0.018 : 0.04;
      geometry = new THREE.CylinderGeometry(style === 'chamfer' ? r * 0.68 : 0, r, h, 4);
      geometry.rotateY(Math.PI / 4);
      center.y = point.y + height + h / 2;
      if (style === 'diamond-chamfer') {
        const shoulder = addMesh(new THREE.BoxGeometry(r * Math.SQRT2 + .005, .011,
          r * Math.SQRT2 + .005), material);
        shoulder.position.copy(atHeight(point, height + .006));
        center.y += .012;
      }
    } else if (style === 'disk' || style === 'scroll') {
      geometry = new THREE.CylinderGeometry(size * 1.45, size * 1.45, 0.018, 24);
      if (style === 'scroll') {
        const direction = tangent.clone().setY(0).normalize();
        const normal = new THREE.Vector3(-direction.z, 0, direction.x);
        const points = [];
        for (let i = 0; i <= 30; i += 1) {
          const t = i / 30;
          const angle = Math.PI * (0.2 + t * 1.65);
          const r = 0.075 * (1 - t * 0.72);
          points.push(atHeight(point, height + 0.065).addScaledVector(direction, Math.cos(angle) * r)
            .addScaledVector(normal, Math.sin(angle) * r));
        }
        const scroll = addMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 30, 0.022, 8, false), m.wood);
        scroll.userData.detail = 'post-cap-scroll';
      }
    } else geometry = new THREE.SphereGeometry(size, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const mesh = addMesh(geometry, style === 'brass-ball' ? m.brass : ['disk', 'scroll'].includes(style) ? m.wood : material);
    mesh.position.copy(center);
    mesh.userData.detail = `post-cap-${style}`;
    return mesh;
  }

  function post(point, height = 0.98, tangent = new THREE.Vector3(1, 0, 0), featured = true) {
    const type = config.handrail ?? 'auto';
    const style = featured ? (config.postStyle ?? 'standard') : 'standard';
    const woodPost = style === 'marine-wood' || style === 'standard' && type.includes('wood')
      && !['escale', 'sillage', 'transat', 'vogue', 'zephyr', 'levant',
        'sonora', 'lips', 'mistral', 'voile', 'nautique', 'cap', 'circulaire', 'kit-carre'].includes(config.model);
    const material = style === 'marine-wood' ? m.wood : style === 'marine-inox' || style === 'marine-crook' ? m.inox : m.post;
    let mesh;
    let capPoint = point;
    if (style.startsWith('marine-')) {
      const direction = tangent.clone().setY(0).normalize();
      const normal = new THREE.Vector3(-direction.z, 0, direction.x);
      const width = woodPost ? 0.065 : 0.043;
      const shape = new THREE.Shape();
      const sweep = (y) => Math.sin(y / height * Math.PI / 2) ** 2 * 0.065;
      shape.moveTo(-width / 2, 0);
      for (let i = 0; i <= 12; i += 1) {
        const y = i / 12 * height;
        shape.lineTo(sweep(y) - width / 2 * (1 - i / 36), y);
      }
      for (let i = 12; i >= 0; i -= 1) {
        const y = i / 12 * height;
        shape.lineTo(sweep(y) + width / 2 * (1 - i / 36), y);
      }
      shape.closePath();
      const depth = woodPost ? 0.055 : 0.012;
      const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 });
      geometry.translate(0, 0, -depth / 2);
      mesh = addMesh(geometry, material);
      mesh.position.copy(point);
      const frame = new THREE.Matrix4().makeBasis(direction, up, normal);
      mesh.quaternion.setFromRotationMatrix(frame);
      capPoint = point.clone().addScaledVector(direction, 0.065);
      // Bright rail sockets make the through-fixings legible on the swept post.
      for (const level of [0.2, 0.39, 0.58, 0.77]) {
        const socket = atHeight(point, level).addScaledVector(direction, sweep(level));
        bar(socket.clone().addScaledVector(normal, -depth / 2 - 0.005),
          socket.clone().addScaledVector(normal, depth / 2 + 0.005), 0.013, m.inox, 12);
      }
      if (style === 'marine-crook') {
        const points = [point.clone().addScaledVector(direction, 0.08).addScaledVector(up, height * 0.38),
          point.clone().addScaledVector(direction, 0.13).addScaledVector(up, height * 0.72),
          capPoint.clone().addScaledVector(direction, 0.035).addScaledVector(up, height + 0.04),
          capPoint.clone().addScaledVector(direction, -0.12).addScaledVector(up, height + 0.06)];
        addMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 18, 0.027, 8, false), m.wood)
          .userData.detail = 'wood-crook';
      }
    } else if (style === 'cast-iron') {
      mesh = lathe([[0, 0], [0, 1.2], [0.03, 1.2], [0.04, 1], [0.09, 1], [0.10, 0.75],
        [0.16, 0.65], [0.19, 0.85], [0.22, 0.60], [0.30, 0.52], [0.34, 0.72],
        [0.38, 0.48], [0.78, 0.42], [0.92, 0.52], [0.96, 0.8], [1, 0.8], [1, 0]],
      height, 0.042, material, point, style);
    } else {
      const width = woodPost ? 0.075 : 0.05;
      const depth = woodPost ? 0.075 : 0.012;
      const geometry = cached(`post:${width}:${depth}:${height}`, () => new THREE.BoxGeometry(width, height + 0.04, depth));
      mesh = addMesh(geometry, material);
      mesh.position.copy(atHeight(point, height / 2));
    }
    mesh.userData.detail = `post-${style}`;
    cap(capPoint, height, woodPost, material, tangent);
    if (!woodPost) {
      const foot = addMesh(cached('post-foot', () => new THREE.BoxGeometry(0.085, 0.012, 0.07)), m.inox);
      foot.position.copy(atHeight(point, 0.008));
    }
    return mesh;
  }

  function baluster(point, bottom = 0.01, top = 0.95) {
    const style = config.balusterStyle ?? 'plain';
    const height = top - bottom;
    const start = atHeight(point, bottom);
    let mesh;
    if (style === 'wood-t0') {
      mesh = addMesh(cached(`wood-t0:${height}`, () => new THREE.BoxGeometry(0.031, height, 0.031)), m.wood);
      mesh.position.copy(atHeight(start, height / 2));
    } else if (style.startsWith('wood-t')) {
      const variant = Number(style.slice(-1));
      const profiles = {
        1: [[0, .7], [.13, .7], [.16, 1], [.19, .7], [.22, .7], [.24, .5], [.72, .5], [.76, .85], [.80, .6], [.87, .7], [1, .7]],
        2: [[0, .8], [.14, .8], [.18, .55], [.31, .43], [.42, .65], [.50, .86], [.58, .65], [.69, .43], [.82, .55], [.86, .8], [1, .8]],
        3: [[0, .85], [.12, .85], [.16, .5], [.21, 1], [.27, .5], [.31, .6], [.48, .36], [.55, .9], [.61, .4], [.74, .6], [.80, 1], [.85, .6], [1, .7]],
        4: [[0, .8], [.13, .8], [.18, 1], [.22, .53], [.30, .43], [.72, .28], [.82, .47], [.87, .8], [1, .8]],
        5: [[0, .75], [.12, .75], [.16, 1], [.20, .48], [.28, .44], [.36, .63], [.64, .63], [.72, .44], [.81, .48], [.85, .9], [1, .75]],
        6: [[0, .8], [.10, .8], [.14, 1], [.19, .48], [.27, .8], [.32, .42], [.43, .7], [.50, .9], [.57, .7], [.68, .42], [.73, .8], [.81, .48], [.86, 1], [1, .8]],
      };
      mesh = lathe([[0, 0], ...profiles[variant] ?? profiles[1], [1, 0]], height, 0.026, m.wood, start, style);
    } else if (style.startsWith('metal-m')) {
      const variant = Number(style.slice(-1));
      const profiles = {
        0: [[0, 1.125], [1, 1.125]],
        1: [[0, 1], [.46, 1], [.48, 1.9], [.50, 2.2], [.52, 1.8], [.54, 1], [1, 1]],
        2: [[0, 1], [.28, 1], [.29, 1.8], [.31, 1.8], [.32, 1], [.68, 1], [.69, 1.8], [.71, 1.8], [.72, 1], [1, 1]],
        3: [[0, 1], [.38, 1], [.39, 1.7], [.42, 1.7], [.44, 2.5], [.47, 1.7], [.53, 1.7], [.56, 2.5], [.58, 1.7], [.61, 1.7], [.62, 1], [1, 1]],
        4: [[0, 1], [.31, 1], [.33, 1.8], [.35, 1], [.40, 1], [.43, 2.1], [.47, 1.6], [.53, 1.6], [.57, 2.1], [.60, 1], [.65, 1], [.67, 1.8], [.69, 1], [1, 1]],
        5: [[0, 1], [.27, 1], [.30, 2.2], [.33, 1.4], [.37, 2.5], [.41, 1.4], [.45, 2.2], [.49, 1.4], [.53, 2.5], [.57, 1.4], [.61, 2.2], [.65, 1.4], [.69, 2.2], [.72, 1], [1, 1]],
      };
      mesh = lathe([[0, 0], ...profiles[variant] ?? profiles[0], [1, 0]], height, 0.008, m.rail, start, style);
    } else mesh = bar(start, atHeight(point, top), config.railMaterial === 'wood' ? 0.016 : 0.009);
    if (mesh) mesh.userData.detail = `baluster-${style}`;
    if (config.railPattern === 'rings') {
      for (const level of [0.24, 0.69]) collar(point, level, config.railMaterial === 'wood' ? 0.024 : 0.015, m.rail);
    }
  }

  function panelGeometry(from, to, bottom, top, material = m.glass) {
    const tangent = to.clone().sub(from);
    const length = tangent.length();
    if (length < 1e-5) return undefined;
    const geometry = new THREE.BufferGeometry();
    const verts = [
      from.x, from.y + bottom, from.z, to.x, to.y + bottom, to.z,
      to.x, to.y + top, to.z, from.x, from.y + top, from.z,
    ];
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geometry.setIndex(material === m.glass
      ? [0, 1, 2, 0, 2, 3]
      : [0, 1, 2, 0, 2, 3, 2, 1, 0, 3, 2, 0]);
    // Separate faces prevent opposite normals cancelling on opaque panels.
    const surface = geometry.toNonIndexed();
    geometry.dispose();
    surface.computeVertexNormals();
    const mesh = addMesh(surface, material);
    mesh.name = material === m.glass ? 'catalogue-glass-panel' : 'catalogue-solid-panel';
    if (material === m.glass) mesh.castShadow = false;
    for (const point of [from, to]) {
      const clamp = addMesh(new THREE.BoxGeometry(0.036, 0.035, 0.038), m.inox);
      clamp.position.copy(atHeight(point, bottom + 0.11));
    }
    return mesh;
  }

  function wallRail(path) {
    handrail(path, 0.9);
    const divisions = Math.max(1, Math.ceil(path.length / 0.9));
    for (let i = 0; i <= divisions; i += 1) {
      const point = path.point(i / divisions);
      const before = path.point(Math.max(0, i / divisions - 0.01));
      const after = path.point(Math.min(1, i / divisions + 0.01));
      const tangent = after.clone().sub(before).setY(0).normalize();
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(0.07);
      const start = atHeight(point, 0.86);
      const end = start.clone().add(normal);
      bar(start, end, 0.009, m.inox);
      bar(end, atHeight(end, -0.055), 0.009, m.inox);
      const plate = addMesh(new THREE.CylinderGeometry(0.026, 0.026, 0.008, 10), m.inox);
      plate.position.copy(atHeight(end, -0.055));
      plate.quaternion.setFromUnitVectors(up, normal.clone().normalize());
    }
  }

  function ramp(points, style = config.railing) {
    if (style === 'none') return;
    const path = route(points);
    if (!path || path.length < 0.03) return;
    if ((config.handrail ?? '').startsWith('wall-')) {
      wallRail(path);
      return;
    }
    handrail(path);
    const spans = Math.max(1, Math.ceil(path.length / 1.0));
    for (let i = 0; i <= spans; i += 1) post(path.point(i / spans), 0.98,
      path.point(Math.min(1, i / spans + .01)).sub(path.point(Math.max(0, i / spans - .01))), i === 0);

    if (style === 'vertical') {
      const divisions = Math.max(2, Math.ceil(path.length / 0.12));
      for (let i = 1; i < divisions; i += 1) baluster(path.point(i / divisions));
    } else if (style === 'horizontal') {
      const levels = config.railPattern === 'one-three-one'
        ? [0.19, 0.44, 0.49, 0.54, 0.80] : [0.2, 0.39, 0.58, 0.77];
      const small = ['one-three-one'].includes(config.railPattern)
        || ['escale', 'sillage', 'transat', 'vogue', 'zephyr', 'levant'].includes(config.model);
      for (const level of levels) roundRail(path, level, small ? 0.006 : 0.009, m.rail);
    } else if (style === 'glass') {
      for (let i = 0; i < spans; i += 1)
        panelGeometry(path.point((i + 0.035) / spans), path.point((i + 0.965) / spans), 0.08, 0.88);
    } else if (style === 'solid') {
      for (let i = 0; i < Math.ceil(path.length / 0.35); i += 1) {
        const divisions = Math.ceil(path.length / 0.35);
        panelGeometry(path.point(i / divisions), path.point((i + 1) / divisions), 0.025, 0.91, m.structure);
      }
    }
  }

  // Every opening is kept within its own cell; no overlapping holes or random
  // triangulation failures. These are original interpretations of the four
  // catalogue motif families, rather than manufacturer fabrication templates.
  function piercedGeometry(width, motif) {
    const height = 0.62;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); shape.lineTo(width, 0); shape.lineTo(width, height);
    shape.lineTo(0, height); shape.closePath();
    const margin = 0.035;
    const usableWidth = Math.max(0.02, width - margin * 2);
    const polygonHole = (points) => {
      const hole = new THREE.Path();
      points.forEach(([x, y], i) => i ? hole.lineTo(x, y) : hole.moveTo(x, y));
      hole.closePath(); shape.holes.push(hole);
    };
    if (motif === 'laser-wave') {
      const rows = 6;
      for (let row = 0; row < rows; row += 1) {
        const center = 0.075 + row * 0.092;
        const points = [];
        for (let i = 0; i <= 18; i += 1) {
          const x = margin + usableWidth * i / 18;
          points.push([x, center + Math.sin(i / 18 * Math.PI * 2 + row * 0.6) * 0.02 - 0.016]);
        }
        for (let i = 18; i >= 0; i -= 1) {
          const x = margin + usableWidth * i / 18;
          points.push([x, center + Math.sin(i / 18 * Math.PI * 2 + row * 0.6) * 0.02 + 0.016]);
        }
        polygonHole(points);
      }
    } else if (motif === 'laser-nature') {
      const columns = Math.max(3, Math.floor(width / 0.14));
      const cell = usableWidth / columns;
      for (let col = 0; col < columns; col += 1) {
        const cx = margin + cell * (col + 0.5);
        // Separate leaf shaped cuts climb like stems, leaving connecting metal.
        for (let row = 0; row < 4; row += 1) {
          const cy = 0.10 + row * 0.135;
          const dx = cell * 0.34;
          const sign = (row + col) % 2 ? 1 : -1;
          polygonHole([[cx - dx, cy - sign * 0.028], [cx - dx * 0.1, cy - 0.045],
            [cx + dx, cy + sign * 0.028], [cx + dx * 0.1, cy + 0.045]]);
        }
      }
    } else if (motif === 'laser-vitrail') {
      const columns = Math.max(3, Math.floor(width / 0.14));
      const rows = 5;
      const cellWidth = usableWidth / columns;
      const cellHeight = (height - margin * 2) / rows;
      const padX = Math.min(0.012, cellWidth * 0.12);
      for (let col = 0; col < columns; col += 1) {
        for (let row = 0; row < rows; row += 1) {
          const x = margin + col * cellWidth;
          const y = margin + row * cellHeight;
          const skew = ((col * 7 + row * 3) % 5 - 2) * 0.003;
          polygonHole([[x + padX, y + 0.012], [x + cellWidth - padX * 1.2, y + 0.025 + skew],
            [x + cellWidth - padX * 1.8, y + cellHeight - 0.012], [x + padX * 1.8, y + cellHeight - 0.028 + skew]]);
        }
      }
    } else {
      const columns = Math.max(4, Math.floor(width / 0.11));
      const cell = usableWidth / columns;
      for (let col = 0; col < columns; col += 1) {
        const cx = margin + cell * (col + 0.5);
        const points = [];
        for (let i = 0; i <= 16; i += 1) {
          const y = 0.045 + 0.53 * i / 16;
          points.push([cx + Math.sin(i / 16 * Math.PI * 1.6 + col * 0.4) * cell * 0.18 - cell * 0.18, y]);
        }
        for (let i = 16; i >= 0; i -= 1) {
          const y = 0.045 + 0.53 * i / 16;
          points.push([cx + Math.sin(i / 16 * Math.PI * 1.6 + col * 0.4) * cell * 0.18 + cell * 0.18, y]);
        }
        polygonHole(points);
      }
    }
    return new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: false, curveSegments: 3 });
  }

  function laserPanel(from, to, motif) {
    const tangent = to.clone().sub(from).setY(0);
    const width = tangent.length();
    if (width < 0.1) return;
    tangent.divideScalar(width);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);
    const mesh = addMesh(piercedGeometry(width, motif), m.rail);
    mesh.name = `catalogue-${motif}`;
    const frame = new THREE.Matrix4().makeBasis(tangent, up, normal);
    mesh.quaternion.setFromRotationMatrix(frame);
    mesh.position.copy(atHeight(from, 0.04));
    mesh.position.addScaledVector(normal, -0.004);
    for (const point of [from, to]) {
      for (const level of [0.18, 0.52]) {
        const clamp = addMesh(new THREE.BoxGeometry(0.032, 0.028, 0.038), m.inox);
        clamp.position.copy(atHeight(point, level));
      }
    }
  }

  function landing(points) {
    const style = config.landingGuard ?? 'none';
    if (style === 'none') return;
    const path = route(points);
    if (!path || path.length < 0.06) return;
    const height = 1.0;
    handrail(path, height);
    const spans = Math.max(1, Math.ceil(path.length / 1.05));
    for (let i = 0; i <= spans; i += 1) post(path.point(i / spans), height,
      path.point(Math.min(1, i / spans + .01)).sub(path.point(Math.max(0, i / spans - .01))), i === 0);
    if (style === 'vertical') {
      const divisions = Math.max(2, Math.ceil(path.length / 0.11));
      for (let i = 1; i < divisions; i += 1) {
        const point = path.point(i / divisions);
        baluster(point, 0.035, 0.97);
      }
      return;
    }
    roundRail(path, 0.77, 0.009, m.rail);
    for (let i = 0; i < spans; i += 1) {
      const from = path.point((i + 0.045) / spans);
      const to = path.point((i + 0.955) / spans);
      if (style === 'glass') {
        panelGeometry(from, to, 0.035, 0.655);
      } else if (style === 'wood') {
        // Open wooden panels, as shown in the 2026 annex; no removed PLB board.
        const divisions = 5;
        for (let row = 0; row < divisions; row += 1) {
          flatBar(atHeight(from, 0.09 + row * 0.12), atHeight(to, 0.09 + row * 0.12), 0.035, 0.07, m.tread);
        }
      } else if (style.startsWith('laser-')) laserPanel(from, to, style);
    }
  }

  return { ramp, landing, post };
}
