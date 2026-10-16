import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// An original architectural study, not a model of a completed SBM project.
export async function initViewer({
  stage,
  canvas,
  onReady = () => {},
  onError = () => {},
  onChange = () => {},
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
    color: 0x21362b,
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

  const state = () => ({
    finish,
    view,
    autoRotate: autoRotate && !reducedMotion.matches,
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
    const distance = fitDistance / currentZoom;
    const target = controls.target;
    if (view === "top") camera.position.set(0.001, target.y + distance, 0.09);
    else if (view === "front") camera.position.set(0, target.y + 0.1, distance);
    else
      camera.position.copy(
        new THREE.Vector3(5.2, 2.6, 7)
          .normalize()
          .multiplyScalar(distance)
          .add(target),
      );
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
      materials.forEach((material) => material.dispose());
      oakTexture.dispose();
      environment.dispose();
      renderer.dispose();
    },
  };

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
