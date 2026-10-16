import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createAmbience } from "./ambience.js";

// An original architectural study, not a model of a completed SBM project.
export async function initViewer({
  stage,
  canvas,
  onReady = () => {},
  onError = () => {},
  onChange = () => {},
  theme = "dark",
  initialConfiguration,
}) {
  if (!stage || !canvas)
    throw new Error("Un support et un canvas sont nécessaires pour la vue 3D.");

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch (error) {
    onError(error);
    throw error;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x10241e, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 70);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = !reducedMotion.matches;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.enableZoom = false; // The page keeps normal wheel scrolling; dedicated buttons zoom.
  controls.rotateSpeed = 0.65;
  controls.autoRotateSpeed = 0.42;
  controls.minPolarAngle = 0.025;
  controls.maxPolarAngle = Math.PI * 0.53;
  controls.target.set(0, 2.03, 0);
  controls.touches.ONE = null;
  controls.touches.TWO = null;
  canvas.style.touchAction = "pan-y";

  let disposed = false;
  let contextLost = false;
  let visible = true;
  let frame = 0;
  let lastFrame = 0;
  let firstRender = true;
  let finish = "graphite";
  let view = "perspective";
  let autoRotate = false;
  let fitDistance = 8;
  let currentZoom = 1;
  let resizeObserver;
  let intersectionObserver;
  let hasConfiguration = false;
  let configuration = {
    shape: "spiral",
    structureMaterial: "steel",
    structureColor: "#383d3a",
    metalFinish: "matte",
    treadMaterial: "oak",
    railing: "vertical",
    risers: false,
    led: false,
    direction: "right",
    height: 280,
    width: 90,
    steps: 16,
    ambience: "studio",
  };
  let modelBounds;

  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.74;
  room.dispose();
  pmrem.dispose();

  const metal = new THREE.MeshStandardMaterial({
    color: 0x383d3a,
    metalness: 0.83,
    roughness: 0.31,
  });
  const railMetal = new THREE.MeshStandardMaterial({
    color: 0x474b46,
    metalness: 0.82,
    roughness: 0.27,
  });
  const fastenerMetal = new THREE.MeshStandardMaterial({
    color: 0x777c70,
    metalness: 0.9,
    roughness: 0.29,
  });
  const plinthMaterial = new THREE.MeshStandardMaterial({
    color: theme === "light" ? 0xd7d5c8 : 0x21362b,
    roughness: 0.89,
    metalness: 0.12,
  });

  // A small, locally generated oak grain keeps the study self-contained.
  const grainCanvas = document.createElement("canvas");
  grainCanvas.width = 512;
  grainCanvas.height = 512;
  const context = grainCanvas.getContext("2d");
  context.fillStyle = "#bf9162";
  context.fillRect(0, 0, 512, 512);
  let seed = 71;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 720; i += 1) {
    const x = random() * 512;
    const amplitude = 0.7 + random() * 4;
    const alpha = 0.025 + random() * 0.08;
    context.strokeStyle = `rgba(${random() > 0.3 ? "82, 46, 21" : "250, 219, 166"}, ${alpha})`;
    context.lineWidth = 0.4 + random() * 1.3;
    context.beginPath();
    context.moveTo(x, 0);
    for (let y = 0; y <= 512; y += 16)
      context.lineTo(x + Math.sin(y * 0.012 + i) * amplitude, y);
    context.stroke();
  }
  const oakTexture = new THREE.CanvasTexture(grainCanvas);
  oakTexture.colorSpace = THREE.SRGBColorSpace;
  oakTexture.wrapS = oakTexture.wrapT = THREE.RepeatWrapping;
  oakTexture.repeat.set(0.8, 0.8);
  oakTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const oak = new THREE.MeshStandardMaterial({
    map: oakTexture,
    color: 0xf3d3a6,
    roughness: 0.6,
    metalness: 0,
  });

  const staircase = new THREE.Group();
  scene.add(staircase);
  const addMesh = (geometry, material, parent = staircase) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const count = 17;
  const rise = 0.197;
  const startAngle = -Math.PI * 0.93;
  const sweep = Math.PI * 1.64;
  const stepAngle = sweep / count;
  const innerRadius = 0.43;
  const outerRadius = 1.43;
  const initialHeight = 0.25;

  const wedge = (inner, outer, from, to, thickness) => {
    const shape = new THREE.Shape();
    shape.moveTo(inner * Math.cos(from), inner * Math.sin(from));
    shape.lineTo(outer * Math.cos(from), outer * Math.sin(from));
    shape.absarc(0, 0, outer, from, to, false);
    shape.lineTo(inner * Math.cos(to), inner * Math.sin(to));
    shape.absarc(0, 0, inner, to, from, true);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelSize: 0.006,
      bevelThickness: 0.006,
      bevelSegments: 2,
      curveSegments: 24,
    });
    geometry.rotateX(Math.PI / 2);
    return geometry;
  };

  for (let i = 0; i < count; i += 1) {
    const from = startAngle + stepAngle * i + 0.008;
    const to = startAngle + stepAngle * (i + 1) - 0.008;
    const tread = addMesh(
      wedge(innerRadius, outerRadius, from, to, 0.074),
      oak,
    );
    tread.position.y = initialHeight + i * rise;

    // A steel saddle underneath each oak tread fixes it to the continuous spine.
    const saddle = addMesh(
      wedge(0.57, 1.28, from + 0.025, to - 0.025, 0.025),
      metal,
    );
    saddle.position.y = tread.position.y - 0.086;
    const middle = (from + to) / 2;
    for (const radius of [0.64, 1.24]) {
      const screw = addMesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.003, 8),
        fastenerMetal,
      );
      screw.position.set(
        radius * Math.cos(middle),
        tread.position.y + 0.007,
        radius * Math.sin(middle),
      );
    }
  }

  // Four connected strips form a solid rolled-steel helical stringer.
  const ribbon = (radius, thickness, height) => {
    const segments = 170;
    const positions = [];
    const indices = [];
    for (let i = 0; i <= segments; i += 1) {
      const progress = i / segments;
      const angle = startAngle + progress * sweep;
      const y = initialHeight + (progress * count - 0.5) * rise - 0.1;
      for (const [r, dy] of [
        [radius - thickness / 2, 0],
        [radius + thickness / 2, 0],
        [radius + thickness / 2, -height],
        [radius - thickness / 2, -height],
      ]) {
        positions.push(r * Math.cos(angle), y + dy, r * Math.sin(angle));
      }
      if (i < segments) {
        for (let edge = 0; edge < 4; edge += 1) {
          const a = i * 4 + edge;
          const b = i * 4 + ((edge + 1) % 4);
          indices.push(a, b, a + 4, b, b + 4, a + 4);
        }
      }
    }
    indices.push(0, 2, 1, 0, 3, 2);
    const end = segments * 4;
    indices.push(end, end + 1, end + 2, end, end + 2, end + 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  };
  addMesh(ribbon(0.91, 0.09, 0.29), metal);

  const balusterGeometry = new THREE.CylinderGeometry(0.009, 0.009, 1, 8);
  const addBalustrade = (radius, subdivisions, railRadius) => {
    const points = [];
    const railHeight = 0.91;
    for (let i = 0; i <= count * 8; i += 1) {
      const progress = i / (count * 8);
      const angle = startAngle + progress * sweep;
      points.push(
        new THREE.Vector3(
          radius * Math.cos(angle),
          initialHeight + (progress * count - 0.5) * rise + railHeight,
          radius * Math.sin(angle),
        ),
      );
    }
    const railCurve = new THREE.CatmullRomCurve3(points);
    addMesh(
      new THREE.TubeGeometry(railCurve, 180, railRadius, 10, false),
      railMetal,
    );

    for (let i = 0; i < count; i += 1) {
      for (let j = 0; j < subdivisions; j += 1) {
        const fraction = (j + 0.5) / subdivisions;
        const angle = startAngle + (i + fraction) * stepAngle;
        const bottom = initialHeight + i * rise - 0.028;
        const top = initialHeight + (i + fraction - 0.5) * rise + railHeight;
        const bar = addMesh(balusterGeometry, railMetal);
        bar.scale.y = top - bottom;
        bar.position.set(
          radius * Math.cos(angle),
          (top + bottom) / 2,
          radius * Math.sin(angle),
        );
      }
    }
    // Slightly heavier end posts give the railing believable terminations.
    for (const [angle, index] of [
      [startAngle + 0.014, 0],
      [startAngle + sweep - 0.014, count - 1],
    ]) {
      const post = addMesh(
        new THREE.CylinderGeometry(0.021, 0.021, railHeight, 12),
        metal,
      );
      post.position.set(
        radius * Math.cos(angle),
        initialHeight + index * rise + railHeight / 2,
        radius * Math.sin(angle),
      );
    }
  };
  addBalustrade(outerRadius - 0.035, 4, 0.026);
  addBalustrade(innerRadius + 0.025, 1, 0.022);

  const footAngle = startAngle + stepAngle * 0.4;
  const foot = addMesh(new THREE.BoxGeometry(0.37, 0.085, 0.32), metal);
  foot.position.set(
    0.91 * Math.cos(footAngle),
    0.075,
    0.91 * Math.sin(footAngle),
  );
  foot.rotation.y = -footAngle;

  const plinth = addMesh(
    new THREE.CylinderGeometry(2.04, 2.11, 0.105, 96),
    plinthMaterial,
    scene,
  );
  plinth.position.y = -0.055;
  const plinthRim = addMesh(
    new THREE.TorusGeometry(2.055, 0.008, 5, 100),
    fastenerMetal,
    scene,
  );
  plinthRim.rotation.x = Math.PI / 2;
  plinthRim.position.y = -0.035;

  const ground = addMesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.ShadowMaterial({ color: 0x020c07, opacity: 0.35 }),
    scene,
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.112;
  ground.castShadow = false;

  scene.add(new THREE.HemisphereLight(0xe0eee5, 0x364237, 1.25));
  const key = new THREE.DirectionalLight(0xffebcd, 3.1);
  key.position.set(3.5, 7.5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = key.shadow.camera.bottom = -3.8;
  key.shadow.camera.right = key.shadow.camera.top = 3.8;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 18;
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.00015;
  key.shadow.blurSamples = 8;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd8a4, 2.2);
  rim.position.set(-4, 4.2, -3);
  scene.add(rim);
  const softbox = new THREE.DirectionalLight(0xcce8dd, 0.95);
  softbox.position.set(-2, 3, 5);
  scene.add(softbox);
  const ambience = createAmbience(scene);
  const updateAmbience = () => {
    const name = configuration.ambience;
    ambience.build(name, modelBounds);
    plinth.visible = name === "studio";
    plinthRim.visible = name === "studio" && configuration.shape === "spiral";
    ground.visible = name === "studio";
    key.color.setHex(name === "warm" ? 0xffdfb4 : name === "studio" ? 0xffebcd : 0xf0f4ef);
    rim.color.setHex(name === "warm" ? 0xffcd91 : name === "studio" ? 0xffd8a4 : 0xe0e9e4);
  };

  // All finishes are generated once, locally. Changing a finish never rebuilds
  // a staircase or resets the camera; geometry changes release the old buffers.
  const textureSet = new Set([oakTexture]);
  const materialSet = new Set([
    metal, railMetal, fastenerMetal, plinthMaterial, oak, ground.material,
  ]);
  const grainTexture = (base, dark, light, textureSeed) => {
    const surface = document.createElement("canvas");
    surface.width = surface.height = 512;
    const brush = surface.getContext("2d");
    brush.fillStyle = base;
    brush.fillRect(0, 0, 512, 512);
    let value = textureSeed;
    const next = () => {
      value = (value * 16807) % 2147483647;
      return (value - 1) / 2147483646;
    };
    for (let i = 0; i < 620; i += 1) {
      const x = next() * 512;
      const wave = next() * 5 + 1;
      brush.globalAlpha = 0.035 + next() * 0.13;
      brush.strokeStyle = next() > 0.28 ? dark : light;
      brush.lineWidth = 0.4 + next() * 1.1;
      brush.beginPath();
      for (let y = 0; y <= 512; y += 8) {
        const dx = x + Math.sin(y * 0.014 + i) * wave;
        if (y === 0) brush.moveTo(dx, y);
        else brush.lineTo(dx, y);
      }
      brush.stroke();
    }
    brush.globalAlpha = 1;
    const texture = new THREE.CanvasTexture(surface);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textureSet.add(texture);
    return texture;
  };
  const walnutTexture = grainTexture("#76503a", "#35231c", "#c89b70", 93);
  const ashTexture = grainTexture("#dfd0b4", "#9b8b70", "#fff3d9", 117);
  const stoneCanvas = document.createElement("canvas");
  stoneCanvas.width = stoneCanvas.height = 512;
  const stoneBrush = stoneCanvas.getContext("2d");
  stoneBrush.fillStyle = "#d2cebf";
  stoneBrush.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 27; i += 1) {
    stoneBrush.strokeStyle = `rgba(92, 100, 94, ${0.025 + (i % 5) * 0.012})`;
    stoneBrush.lineWidth = 0.8 + (i % 4) * 0.4;
    stoneBrush.beginPath();
    stoneBrush.moveTo(-60 + i * 34, 0);
    stoneBrush.bezierCurveTo(80 + i * 13, 180, i * 21 - 100, 330, i * 37, 512);
    stoneBrush.stroke();
  }
  const stoneTexture = new THREE.CanvasTexture(stoneCanvas);
  stoneTexture.colorSpace = THREE.SRGBColorSpace;
  stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping;
  textureSet.add(stoneTexture);
  const brushCanvas = document.createElement("canvas");
  brushCanvas.width = brushCanvas.height = 128;
  const metalBrush = brushCanvas.getContext("2d");
  metalBrush.fillStyle = "#808080";
  metalBrush.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 128; i += 1) {
    metalBrush.fillStyle = `rgb(${110 + ((i * 37) % 38)},${110 + ((i * 37) % 38)},${110 + ((i * 37) % 38)})`;
    metalBrush.fillRect(i, 0, 1, 128);
  }
  const brushedTexture = new THREE.CanvasTexture(brushCanvas);
  brushedTexture.wrapS = brushedTexture.wrapT = THREE.RepeatWrapping;
  textureSet.add(brushedTexture);
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc8e0d7,
    roughness: 0.065,
    metalness: 0.03,
    transparent: true,
    opacity: 0.32,
    transmission: 0.22,
    thickness: 0.014,
    ior: 1.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ledMaterial = new THREE.MeshStandardMaterial({
    color: 0xffe1ac,
    emissive: 0xffbd60,
    emissiveIntensity: 3,
    roughness: 0.36,
  });
  materialSet.add(glassMaterial);
  materialSet.add(ledMaterial);

  const clearStaircase = () => {
    const geometries = new Set();
    staircase.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
    });
    geometries.forEach((geometry) => geometry.dispose());
    staircase.clear();
    staircase.position.set(0, 0, 0);
    staircase.scale.set(1, 1, 1);
  };
  const segment = (from, to, radius, material = railMetal) => {
    const length = from.distanceTo(to);
    if (length < 0.0001) return;
    const mesh = addMesh(new THREE.CylinderGeometry(radius, radius, length, 8), material);
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
    return mesh;
  };
  const beam = (from, to, thickness = 0.09, depth = 0.22) => {
    const mesh = addMesh(new THREE.BoxGeometry(thickness, depth, from.distanceTo(to)), metal);
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), to.clone().sub(from).normalize());
    return mesh;
  };
  const tube = (points, radius, material = railMetal) => {
    if (points.length < 2) return;
    return addMesh(new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points), Math.max(12, points.length * 2), radius, 8, false,
    ), material);
  };
  const raise = (point, amount) => point.clone().add(new THREE.Vector3(0, amount, 0));
  const panel = (points, material, lower = 0.12, upper = 0.88) => {
    const positions = [];
    const indices = [];
    const uvs = [];
    points.forEach((point, i) => {
      positions.push(point.x, point.y + lower, point.z, point.x, point.y + upper, point.z);
      uvs.push(i / (points.length - 1), 0, i / (points.length - 1), 1);
      if (i > 0) {
        const a = (i - 1) * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = addMesh(geometry, material);
    if (material === glassMaterial) mesh.castShadow = false;
    return mesh;
  };
  const guardrail = (points, pickets, style = configuration.railing) => {
    if (style === "none") return;
    tube(points.map((point) => raise(point, 0.94)), 0.023);
    if (style === "vertical") {
      pickets.forEach(({ bottom, top }) => segment(bottom, raise(top, 0.925), 0.009));
    } else if (style === "horizontal") {
      [0.24, 0.44, 0.64, 0.82].forEach((level) => tube(points.map((point) => raise(point, level)), 0.008));
    } else if (style === "glass") {
      // Separate panels leave realistic expansion joints and visible clamps.
      const panelLength = Math.max(2, Math.ceil((points.length - 1) / Math.max(1, Math.ceil(pickets.length / 6))));
      for (let i = 0; i < points.length - 1; i += panelLength) {
        const part = points.slice(i, Math.min(i + panelLength + 1, points.length));
        if (part.length < 2) continue;
        const first = part[0].clone();
        const last = part.at(-1).clone();
        part[0].lerp(part[1], 0.05);
        part[part.length - 1].lerp(part[part.length - 2], 0.05);
        panel(part, glassMaterial, 0.16, 0.87);
        for (const base of [first, last]) {
          const clamp = addMesh(new THREE.BoxGeometry(0.032, 0.06, 0.04), fastenerMetal);
          clamp.position.copy(raise(base, 0.23));
        }
      }
    } else {
      panel(points, metal, 0.05, 0.91);
      // Reverse surface prevents sheet-metal guards disappearing from inside.
      panel([...points].reverse(), metal, 0.05, 0.91);
    }
    const spacing = style === "vertical" ? Math.max(1, points.length - 1) : Math.max(2, Math.ceil(points.length / 5));
    for (let i = 0; i < points.length; i += spacing) {
      segment(raise(points[i], -0.025), raise(points[i], 0.95), 0.018, metal);
    }
    segment(raise(points.at(-1), -0.025), raise(points.at(-1), 0.95), 0.018, metal);
  };

  const applyMaterials = () => {
    const surface = {
      matte: { roughness: 0.72, metalness: 0.54 },
      brushed: { roughness: 0.32, metalness: 0.86 },
      polished: { roughness: 0.12, metalness: 0.96 },
    }[configuration.metalFinish];
    for (const material of [metal, railMetal]) {
      material.color.set(configuration.structureColor);
      material.roughness = surface.roughness;
      material.metalness = surface.metalness;
      material.bumpMap = configuration.metalFinish === "brushed" ? brushedTexture : null;
      material.bumpScale = 0.013;
      material.needsUpdate = true;
    }
    const structureWood = {
      wood: { map: oakTexture, color: 0xffe8c5 },
      walnut: { map: walnutTexture, color: 0xf3cfad },
      ash: { map: ashTexture, color: 0xfff0d6 },
    }[configuration.structureMaterial];
    if (structureWood) {
      metal.map = structureWood.map;
      metal.color.setHex(structureWood.color);
      metal.roughness = 0.57;
      metal.metalness = 0;
      metal.bumpMap = null;
    } else {
      metal.map = null;
      if (configuration.structureMaterial === "aluminium") {
        metal.color.setHex(0xc8cfce);
        metal.metalness = 0.92;
        metal.roughness = { matte: 0.56, brushed: 0.34, polished: 0.18 }[configuration.metalFinish];
      } else if (configuration.structureMaterial === "stainless") {
        metal.color.setHex(0xa5b9be);
        metal.metalness = 0.98;
        metal.roughness = { matte: 0.44, brushed: 0.24, polished: 0.08 }[configuration.metalFinish];
      }
    }
    metal.needsUpdate = true;
    const treads = {
      oak: { map: oakTexture, color: 0xffe2bc, roughness: 0.57, metalness: 0 },
      walnut: { map: walnutTexture, color: 0xf3cfad, roughness: 0.5, metalness: 0 },
      ash: { map: ashTexture, color: 0xfff0d6, roughness: 0.62, metalness: 0 },
      steel: { map: null, color: 0x90978e, roughness: 0.28, metalness: 0.88 },
      stone: { map: stoneTexture, color: 0xe5e2d8, roughness: 0.37, metalness: 0 },
    }[configuration.treadMaterial];
    oak.map = treads.map;
    oak.color.setHex(treads.color);
    oak.roughness = treads.roughness;
    oak.metalness = treads.metalness;
    oak.bumpMap = configuration.treadMaterial === "stone" ? stoneTexture : null;
    oak.bumpScale = 0.005;
    oak.needsUpdate = true;
  };

  const buildSpiral = () => {
    const count = configuration.steps;
    const rise = configuration.height / 100 / count;
    const width = configuration.width / 100;
    const inner = 0.25;
    const outer = inner + width;
    const start = -Math.PI * 0.93;
    const sweep = Math.PI * 1.82;
    const angleStep = sweep / count;
    const base = 0.045;
    const ribbonGeometry = (radius, thickness, depth, offset = -0.095) => {
      const positions = [];
      const indices = [];
      const uvs = [];
      const slices = count * 10;
      for (let i = 0; i <= slices; i += 1) {
        const progress = i / slices;
        const angle = start + progress * sweep;
        const top = base + (progress * count + 0.5) * rise + offset;
        for (const [r, dy] of [[radius - thickness / 2, 0], [radius + thickness / 2, 0], [radius + thickness / 2, -depth], [radius - thickness / 2, -depth]]) {
          positions.push(r * Math.cos(angle), top + dy, r * Math.sin(angle));
          uvs.push(progress * 4, dy === 0 ? 1 : 0);
        }
        if (i < slices) {
          for (let side = 0; side < 4; side += 1) {
            const a = i * 4 + side;
            const b = i * 4 + ((side + 1) % 4);
            indices.push(a, b, a + 4, b, b + 4, a + 4);
          }
        }
      }
      indices.push(0, 2, 1, 0, 3, 2);
      const last = slices * 4;
      indices.push(last, last + 1, last + 2, last, last + 2, last + 3);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      return geometry;
    };
    for (let i = 0; i < count; i += 1) {
      const from = start + angleStep * i + 0.007;
      const to = start + angleStep * (i + 1) - 0.007;
      const top = base + (i + 1) * rise;
      const tread = addMesh(wedge(inner, outer, from, to, 0.062), oak);
      tread.position.y = top;
      const saddle = addMesh(wedge(inner + 0.05, outer - 0.08, from + 0.02, to - 0.02, 0.022), metal);
      saddle.position.y = top - 0.074;
      if (configuration.risers) {
        const riser = addMesh(new THREE.BoxGeometry(width, rise - 0.048, 0.023), metal);
        const radius = inner + width / 2;
        riser.position.set(radius * Math.cos(from), top - rise / 2 - 0.02, radius * Math.sin(from));
        riser.rotation.y = -from;
      }
      if (configuration.led) {
        const light = addMesh(new THREE.BoxGeometry(width * 0.87, 0.012, 0.013), ledMaterial);
        const radius = inner + width / 2;
        light.position.set(radius * Math.cos(from - 0.004), top - 0.048, radius * Math.sin(from - 0.004));
        light.rotation.y = -from;
        light.castShadow = false;
        const backlight = addMesh(new THREE.BoxGeometry(width * 0.87, 0.01, 0.013), ledMaterial);
        backlight.position.set(radius * Math.cos(to + 0.004), top - 0.048, radius * Math.sin(to + 0.004));
        backlight.rotation.y = -to;
        backlight.castShadow = false;
      }
      const middle = (from + to) / 2;
      for (const radius of [inner + 0.1, outer - 0.12]) {
        const screw = addMesh(new THREE.CylinderGeometry(0.011, 0.011, 0.004, 6), fastenerMetal);
        screw.position.set(radius * Math.cos(middle), top + 0.003, radius * Math.sin(middle));
      }
    }
    addMesh(ribbonGeometry(inner + width * 0.49, 0.10, 0.23), metal);
    for (const [radius, subdivisions] of [[outer - 0.035, 3], [inner + 0.025, 1]]) {
      const points = [];
      const pickets = [];
      for (let i = 0; i <= count * 4; i += 1) {
        const progress = i / (count * 4);
        const angle = start + progress * sweep;
        points.push(new THREE.Vector3(radius * Math.cos(angle), base + (progress * count + 0.5) * rise, radius * Math.sin(angle)));
      }
      for (let i = 0; i < count; i += 1) {
        for (let j = 0; j < subdivisions; j += 1) {
          const fraction = (j + 0.5) / subdivisions;
          const angle = start + (i + fraction) * angleStep;
          pickets.push({
            bottom: new THREE.Vector3(radius * Math.cos(angle), base + (i + 1) * rise - 0.02, radius * Math.sin(angle)),
            top: new THREE.Vector3(radius * Math.cos(angle), base + (i + fraction + 0.5) * rise, radius * Math.sin(angle)),
          });
        }
      }
      guardrail(points, pickets);
    }
    const footRadius = inner + width * 0.49;
    const footAngle = start + angleStep / 2;
    const foot = addMesh(new THREE.BoxGeometry(0.32, 0.06, 0.25), metal);
    foot.position.set(footRadius * Math.cos(footAngle), 0.055, footRadius * Math.sin(footAngle));
    foot.rotation.y = -footAngle;
  };

  const buildFlights = () => {
    const count = configuration.steps;
    const rise = configuration.height / 100 / count;
    const width = configuration.width / 100;
    const depth = 0.29;
    const base = 0.035;
    const flights = [];
    let landing;
    if (configuration.shape === "straight") {
      flights.push({ count, offset: 0, x: 0, z: 0, angle: 0 });
    } else {
      const firstCount = Math.ceil(count / 2);
      const secondCount = count - firstCount;
      const run = (firstCount - 1) * depth;
      if (configuration.shape === "quarter") {
        const centerZ = run + depth / 2 + width / 2;
        flights.push({ count: firstCount, offset: 0, x: 0, z: 0, angle: 0 });
        flights.push({ count: secondCount, offset: firstCount, x: width / 2 + depth / 2, z: centerZ, angle: Math.PI / 2 });
        landing = { x: 0, z: centerZ, width, depth: width, top: base + firstCount * rise, quarter: true };
      } else {
        const gap = 0.16;
        const side = (width + gap) / 2;
        flights.push({ count: firstCount, offset: 0, x: -side, z: 0, angle: 0 });
        flights.push({ count: secondCount, offset: firstCount, x: side, z: run, angle: Math.PI });
        landing = { x: 0, z: run + depth / 2 + width / 2, width: width * 2 + gap, depth: width, top: base + firstCount * rise, quarter: false };
      }
    }
    for (const flight of flights) {
      const across = new THREE.Vector3(Math.cos(flight.angle), 0, -Math.sin(flight.angle));
      const forward = new THREE.Vector3(Math.sin(flight.angle), 0, Math.cos(flight.angle));
      const at = (distance, lateral, y) => new THREE.Vector3(flight.x, y, flight.z).addScaledVector(forward, distance).addScaledVector(across, lateral);
      for (let i = 0; i < flight.count; i += 1) {
        const top = base + (flight.offset + i + 1) * rise;
        const tread = addMesh(new THREE.BoxGeometry(width, 0.062, depth + 0.022), oak);
        tread.position.copy(at(i * depth, 0, top - 0.031));
        tread.rotation.y = flight.angle;
        const saddle = addMesh(new THREE.BoxGeometry(width * 0.84, 0.023, depth * 0.68), metal);
        saddle.position.copy(at(i * depth, 0, top - 0.076));
        saddle.rotation.y = flight.angle;
        if (configuration.risers) {
          const riser = addMesh(new THREE.BoxGeometry(width - 0.015, rise - 0.052, 0.022), metal);
          riser.position.copy(at(i * depth - depth / 2 + 0.009, 0, top - rise / 2 - 0.018));
          riser.rotation.y = flight.angle;
        }
        if (configuration.led) {
          for (const edge of [-1, 1]) {
            const light = addMesh(new THREE.BoxGeometry(width * 0.88, 0.01, 0.014), ledMaterial);
            light.position.copy(at(i * depth + edge * (depth / 2 + 0.012), 0, top - 0.048));
            light.rotation.y = flight.angle;
            light.castShadow = false;
          }
        }
      }
      const startY = base + (flight.offset + 0.5) * rise;
      const endY = base + (flight.offset + flight.count + 0.5) * rise;
      const run = flight.count * depth;
      for (const side of [-1, 1]) {
        const points = [];
        const pickets = [];
        for (let i = 0; i <= flight.count; i += 1) {
          points.push(at(i * depth - depth / 2, side * (width / 2 - 0.025), startY + i * rise));
        }
        for (let i = 0; i < flight.count; i += 1) {
          for (let j = 0; j < 3; j += 1) {
            const progress = i + (j + 0.5) / 3;
            const distance = progress * depth - depth / 2;
            pickets.push({
              bottom: at(distance, side * (width / 2 - 0.025), base + (flight.offset + i + 1) * rise - 0.02),
              top: at(distance, side * (width / 2 - 0.025), startY + progress * rise),
            });
          }
        }
        guardrail(points, pickets);
        beam(at(-depth / 2, side * width * 0.34, startY - 0.1), at(run - depth / 2, side * width * 0.34, endY - 0.1));
      }
      if (flight.offset === 0) {
        for (const side of [-1, 1]) {
          const foot = addMesh(new THREE.BoxGeometry(0.23, 0.045, 0.28), metal);
          foot.position.copy(at(-depth * 0.26, side * width * 0.34, 0.045));
          foot.rotation.y = flight.angle;
        }
      }
    }
    if (landing) {
      const { x, z, width: landingWidth, depth: landingDepth, top, quarter } = landing;
      const surface = addMesh(new THREE.BoxGeometry(landingWidth, 0.065, landingDepth), oak);
      surface.position.set(x, top - 0.0325, z);
      const support = addMesh(new THREE.BoxGeometry(landingWidth - 0.03, 0.12, landingDepth - 0.03), metal);
      support.position.set(x, top - 0.12, z);
      for (const side of [-1, 1]) {
        const cornerX = x + side * (landingWidth / 2 - 0.08);
        const cornerZ = z + landingDepth / 2 - 0.08;
        const leg = addMesh(new THREE.BoxGeometry(0.065, top - 0.1, 0.065), metal);
        leg.position.set(cornerX, (top - 0.1) / 2, cornerZ);
        const plate = addMesh(new THREE.BoxGeometry(0.19, 0.035, 0.19), metal);
        plate.position.set(cornerX, 0.025, cornerZ);
      }
      // The open landing edges align with both flights. Access stays clear.
      const edges = [[new THREE.Vector3(x - landingWidth / 2 + 0.025, top, z + landingDepth / 2 - 0.025), new THREE.Vector3(x + landingWidth / 2 - 0.025, top, z + landingDepth / 2 - 0.025)]];
      if (quarter) edges.push([new THREE.Vector3(x - landingWidth / 2 + 0.025, top, z - landingDepth / 2), new THREE.Vector3(x - landingWidth / 2 + 0.025, top, z + landingDepth / 2 - 0.025)]);
      else {
        for (const side of [-1, 1]) edges.push([
          new THREE.Vector3(x + side * (landingWidth / 2 - 0.025), top, z - landingDepth / 2),
          new THREE.Vector3(x + side * (landingWidth / 2 - 0.025), top, z + landingDepth / 2 - 0.025),
        ]);
      }
      for (const [from, to] of edges) {
        const points = [];
        const pickets = [];
        const divisions = Math.ceil(from.distanceTo(to) / 0.09);
        for (let i = 0; i <= divisions; i += 1) points.push(from.clone().lerp(to, i / divisions));
        for (let i = 1; i < divisions; i += 1) pickets.push({ bottom: points[i], top: points[i] });
        guardrail(points, pickets);
      }
    }
  };

  const rebuildModel = () => {
    clearStaircase();
    if (configuration.shape === "spiral") buildSpiral();
    else buildFlights();
    staircase.scale.x = configuration.direction === "left" ? -1 : 1;
    staircase.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(staircase);
    const center = bounds.getCenter(new THREE.Vector3());
    staircase.position.x = -center.x;
    staircase.position.z = -center.z;
    staircase.updateMatrixWorld(true);
    modelBounds = new THREE.Box3().setFromObject(staircase);
    const size = modelBounds.getSize(new THREE.Vector3());
    plinth.geometry.dispose();
    if (configuration.shape === "spiral") {
      const radius = configuration.width / 100 + 0.25 + 0.23;
      plinth.geometry = new THREE.CylinderGeometry(radius, radius + 0.035, 0.09, 80);
      plinthRim.visible = true;
      plinthRim.geometry.dispose();
      plinthRim.geometry = new THREE.TorusGeometry(radius + 0.014, 0.006, 5, 100);
    } else {
      plinth.geometry = new THREE.BoxGeometry(size.x + 0.36, 0.09, size.z + 0.36);
      plinthRim.visible = false;
    }
    plinth.position.y = -0.055;
    plinth.updateMatrixWorld(true);
    modelBounds.union(new THREE.Box3().setFromObject(plinth));
    ground.geometry.dispose();
    ground.geometry = new THREE.PlaneGeometry(size.x + 2.5, size.z + 2.5);
    ground.material.opacity = theme === "light" ? 0.16 : 0.35;
    controls.target.set(0, (modelBounds.max.y + Math.max(0, modelBounds.min.y)) / 2, 0);
    // Tight bounds preserve shadow-map detail even for the longest straight run.
    const radius = Math.max(size.x, size.z, size.y) * 0.8 + 1;
    key.shadow.camera.left = key.shadow.camera.bottom = -radius;
    key.shadow.camera.right = key.shadow.camera.top = radius;
    key.shadow.camera.updateProjectionMatrix();
    key.shadow.needsUpdate = true;
  };

  const sanitizeConfiguration = (input = {}) => {
    const next = { ...configuration };
    const choices = {
      shape: ["spiral", "straight", "quarter", "half"],
      structureMaterial: ["steel", "wood", "walnut", "ash", "aluminium", "stainless"],
      metalFinish: ["matte", "brushed", "polished"],
      treadMaterial: ["oak", "walnut", "ash", "steel", "stone"],
      railing: ["none", "vertical", "horizontal", "glass", "solid"],
      direction: ["right", "left"],
      ambience: ["studio", "warm", "contemporary", "professional"],
    };
    for (const [key, values] of Object.entries(choices)) {
      if (values.includes(input[key])) next[key] = input[key];
    }
    if (typeof input.structureColor === "string" && /^#[\da-f]{6}$/i.test(input.structureColor)) next.structureColor = input.structureColor.toLowerCase();
    for (const key of ["risers", "led"]) {
      if (typeof input[key] === "boolean") next[key] = input[key];
    }
    for (const [key, min, max] of [["height", 240, 360], ["width", 70, 130], ["steps", 12, 20]]) {
      if (input[key] === undefined || input[key] === null || input[key] === "") continue;
      const number = Number(input[key]);
      if (Number.isFinite(number)) next[key] = THREE.MathUtils.clamp(Math.round(number), min, max);
    }
    return next;
  };

  const state = () => ({
    finish,
    view,
    autoRotate: autoRotate && !reducedMotion.matches,
    configuration: { ...configuration },
  });
  const notify = () => onChange(state());
  const requestRender = () => {
    if (!disposed && !contextLost && visible && !document.hidden && !frame)
      frame = requestAnimationFrame(render);
  };

  function render(time) {
    frame = 0;
    if (disposed || contextLost || !visible || document.hidden) return;
    const delta = Math.min((time - lastFrame) / 1000 || 1 / 60, 0.05);
    lastFrame = time;
    controls.autoRotate = autoRotate && !reducedMotion.matches;
    const changed = controls.update(delta);
    try {
      ambience.update(camera);
      renderer.render(scene, camera);
    } catch (error) {
      onError(error);
      return;
    }
    if (firstRender) {
      firstRender = false;
      onReady(controller);
    }
    if (controls.autoRotate || changed) requestRender();
  }

  const applyCamera = () => {
    const target = controls.target;
    const direction = view === "top" ? new THREE.Vector3(0.001, 1, 0.01).normalize()
      : view === "front" ? new THREE.Vector3(0, 0.01, 1).normalize()
      : new THREE.Vector3(5.2, 2.6, 7).normalize();
    if (modelBounds) {
      const right = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
      const up = direction.clone().cross(right).normalize();
      const verticalTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const horizontalTan = verticalTan * camera.aspect;
      let distance = 1;
      for (const x of [modelBounds.min.x - 0.12, modelBounds.max.x + 0.12]) {
        for (const y of [Math.min(-0.12, modelBounds.min.y), modelBounds.max.y]) {
          for (const z of [modelBounds.min.z - 0.12, modelBounds.max.z + 0.12]) {
            const corner = new THREE.Vector3(x, y, z).sub(target);
            distance = Math.max(distance,
              corner.dot(direction) + Math.abs(corner.dot(right)) / horizontalTan,
              corner.dot(direction) + Math.abs(corner.dot(up)) / verticalTan,
            );
          }
        }
      }
      fitDistance = distance * 1.08;
    }
    const distance = fitDistance / currentZoom;
    camera.position.copy(direction.multiplyScalar(distance).add(target));
    camera.lookAt(target);
    controls.minDistance = fitDistance / 1.65;
    controls.maxDistance = fitDistance * 1.4;
    controls.update();
    requestRender();
  };

  const resize = () => {
    if (disposed) return;
    const { width, height } = canvas.parentElement.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (modelBounds) {
      applyCamera();
      return;
    }
    const vertical = 3.1 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const horizontal =
      2.22 /
      (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
    const nextDistance = Math.max(vertical, horizontal);
    if (Math.abs(fitDistance - nextDistance) > 0.01 || firstRender) {
      fitDistance = nextDistance;
      applyCamera();
    }
    requestRender();
  };

  const handleControls = () => {
    requestRender();
  };
  const handleInteraction = () => {
    if (autoRotate) {
      autoRotate = false;
      notify();
    }
    view = "perspective";
    notify();
  };
  const handleMotion = () => {
    controls.enableDamping = !reducedMotion.matches;
    controls.autoRotate = autoRotate && !reducedMotion.matches;
    requestRender();
    notify();
  };
  const handleVisibility = () => {
    if (document.hidden && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      lastFrame = 0;
      requestRender();
    }
  };
  const handleContextLost = (event) => {
    event.preventDefault();
    contextLost = true;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    onError(new Error("La vue 3D a été interrompue par le navigateur."));
  };
  const handleContextRestored = () => {
    contextLost = false;
    firstRender = true;
    requestRender();
  };

  const controller = {
    setConfiguration(input) {
      if (disposed || !input || typeof input !== "object") return;
      const next = sanitizeConfiguration(input);
      const geometryKeys = ["shape", "railing", "risers", "led", "direction", "height", "width", "steps"];
      const geometryChanged = !hasConfiguration || geometryKeys.some((key) => next[key] !== configuration[key]);
      const ambienceChanged = !hasConfiguration || next.ambience !== configuration.ambience;
      const changed = !hasConfiguration || Object.keys(next).some((key) => next[key] !== configuration[key]);
      if (!changed) return;
      configuration = next;
      hasConfiguration = true;
      applyMaterials();
      if (geometryChanged) {
        rebuildModel();
        currentZoom = 1;
        applyCamera();
      }
      if (geometryChanged || ambienceChanged) updateAmbience();
      requestRender();
      notify();
    },
    getConfiguration() {
      return { ...configuration };
    },
    setFinish(name) {
      const finishes = {
        graphite: {
          body: 0x383d3a,
          rail: 0x474b46,
          roughness: 0.31,
          metalness: 0.83,
        },
        bronze: {
          body: 0x886343,
          rail: 0xa77b50,
          roughness: 0.32,
          metalness: 0.86,
        },
        ivory: {
          body: 0xdcd8c9,
          rail: 0xe6dfcf,
          roughness: 0.47,
          metalness: 0.23,
        },
      };
      if (!finishes[name] || disposed) return;
      finish = name;
      const value = finishes[name];
      metal.color.setHex(value.body);
      railMetal.color.setHex(value.rail);
      metal.roughness = value.roughness;
      metal.metalness = value.metalness;
      railMetal.roughness = value.roughness;
      railMetal.metalness = value.metalness;
      configuration.structureColor = `#${value.body.toString(16).padStart(6, "0")}`;
      configuration.metalFinish = name === "ivory" ? "matte" : "brushed";
      if (hasConfiguration) applyMaterials();
      requestRender();
      notify();
    },
    setView(name) {
      if (!["perspective", "front", "top"].includes(name) || disposed) return;
      view = name;
      autoRotate = false;
      applyCamera();
      notify();
    },
    setAutoRotate(value) {
      autoRotate = Boolean(value) && !reducedMotion.matches;
      requestRender();
      notify();
    },
    rotate(delta) {
      if (disposed || !Number.isFinite(delta)) return;
      autoRotate = false;
      view = "perspective";
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), delta);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      requestRender();
      notify();
    },
    zoom(factor) {
      if (disposed || !Number.isFinite(factor) || factor <= 0) return;
      const previous = currentZoom;
      currentZoom = THREE.MathUtils.clamp(currentZoom * factor, 0.72, 1.5);
      camera.position
        .sub(controls.target)
        .multiplyScalar(previous / currentZoom)
        .add(controls.target);
      controls.update();
      requestRender();
      notify();
    },
    reset() {
      if (disposed) return;
      currentZoom = 1;
      view = "perspective";
      autoRotate = false;
      applyCamera();
      notify();
    },
    // Optional: explicitly engage touch manipulation; false preserves page scroll.
    setInteraction(enabled) {
      controls.touches.ONE = enabled ? THREE.TOUCH.ROTATE : null;
      controls.touches.TWO = enabled ? THREE.TOUCH.DOLLY_ROTATE : null;
      canvas.style.touchAction = enabled ? "none" : "pan-y";
    },
    resize,
    dispose() {
      if (disposed) return;
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotion.removeEventListener("change", handleMotion);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      window.removeEventListener("resize", resize);
      controls.removeEventListener("change", handleControls);
      controls.removeEventListener("start", handleInteraction);
      controls.dispose();
      ambience.dispose();
      const geometries = new Set();
      const materials = new Set();
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material)
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((material) => materials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose());
      for (const material of materialSet) materials.add(material);
      materials.forEach((material) => material.dispose());
      textureSet.forEach((texture) => texture.dispose());
      environment.dispose();
      renderer.dispose();
    },
  };

  if (initialConfiguration) controller.setConfiguration(initialConfiguration);

  controls.addEventListener("change", handleControls);
  controls.addEventListener("start", handleInteraction);
  reducedMotion.addEventListener("change", handleMotion);
  document.addEventListener("visibilitychange", handleVisibility);
  canvas.addEventListener("webglcontextlost", handleContextLost);
  canvas.addEventListener("webglcontextrestored", handleContextRestored);
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
  } else window.addEventListener("resize", resize);
  if ("IntersectionObserver" in window) {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (!visible && frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
        if (visible) {
          lastFrame = 0;
          requestRender();
        }
      },
      { rootMargin: "80px" },
    );
    intersectionObserver.observe(stage);
  }
  resize();
  requestRender();
  return controller;
}
