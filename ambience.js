import * as THREE from "three";

// Original, lightweight room studies. The room adapts to the stair footprint;
// it is never used as a measured representation of the customer's premises.
export function createAmbience(scene) {
  const root = new THREE.Group();
  root.name = "optional-room";
  // Replace the studio pedestal at its top surface so stair feet meet the floor.
  root.position.y = 0.1;
  scene.add(root);
  const surfaces = new Set();
  const geometries = new Set();
  const textures = new Set();
  let backWall;
  let sideWall;
  let back;
  let left;

  function clear() {
    root.clear();
    geometries.forEach((item) => item.dispose());
    surfaces.forEach((item) => item.dispose());
    textures.forEach((item) => item.dispose());
    geometries.clear();
    surfaces.clear();
    textures.clear();
    backWall = sideWall = null;
  }
  const material = (color, options = {}) => {
    const value = new THREE.MeshStandardMaterial({ color, roughness: 0.88, ...options });
    surfaces.add(value);
    return value;
  };
  const mesh = (geometry, surface, x, y, z, parent = root) => {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, surface);
    object.position.set(x, y, z);
    object.receiveShadow = true;
    object.castShadow = true;
    parent.add(object);
    return object;
  };
  const box = (w, h, d, surface, x, y, z, parent) =>
    mesh(new THREE.BoxGeometry(w, h, d), surface, x, y, z, parent);
  const plane = (w, h, surface, x, y, z, parent) => {
    const object = mesh(new THREE.PlaneGeometry(w, h), surface, x, y, z, parent);
    object.castShadow = false;
    return object;
  };
  function plant(x, z, scale = 1) {
    const pot = material(0xc1ac8e);
    const leaves = material(0x3f6550);
    const stem = material(0x646647);
    mesh(new THREE.CylinderGeometry(0.22 * scale, 0.16 * scale, 0.43 * scale, 24), pot, x, 0.1 * scale, z);
    for (let i = 0; i < 9; i += 1) {
      const angle = i * 2.4;
      const h = (0.6 + (i % 4) * 0.17) * scale;
      const radius = (0.14 + (i % 3) * 0.06) * scale;
      const dx = Math.cos(angle) * radius;
      const dz = Math.sin(angle) * radius;
      mesh(new THREE.CylinderGeometry(0.009, 0.013, h, 6), stem, x + dx / 2, h / 2 + 0.2 * scale, z + dz / 2);
      const leaf = mesh(new THREE.SphereGeometry(1, 10, 7), leaves, x + dx, h + 0.15 * scale, z + dz);
      leaf.scale.set(0.12 * scale, 0.32 * scale, 0.045 * scale);
      leaf.rotation.set(0.3, angle, 0.55);
    }
  }
  function build(name, bounds) {
    clear();
    if (name === "studio" || !bounds) return;
    const warm = name === "warm";
    const business = name === "professional";
    const width = Math.max(6.8, bounds.max.x - bounds.min.x + 4.1);
    const depth = Math.max(6, bounds.max.z - bounds.min.z + 3.3);
    const height = Math.max(3.5, bounds.max.y + 0.25);
    left = -width / 2;
    back = -depth / 2;
    const plaster = material(warm ? 0xe4d8c8 : business ? 0xd8dcd7 : 0xe7e5de);
    const accent = material(warm ? 0xa27960 : business ? 0x365c51 : 0xa8afa0);
    const dark = material(0x353d39, { roughness: 0.45, metalness: 0.35 });
    const timber = material(warm ? 0xb68f62 : 0x99816a);
    const fabric = material(warm ? 0xd9c7ad : 0xd5d7cd);
    const floor = material(warm ? 0xc5a47c : business ? 0xaeb6af : 0xc8c6ba);
    const joint = material(warm ? 0x9f805b : 0xb1b2a7);
    if (warm) {
      const grain = document.createElement("canvas");
      grain.width = grain.height = 256;
      const brush = grain.getContext("2d");
      brush.fillStyle = "#c5a47c";
      brush.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 170; i += 1) {
        brush.strokeStyle = i % 3 ? "#6c4c2820" : "#f5dfb925";
        brush.lineWidth = 0.4;
        brush.beginPath();
        for (let y = 0; y <= 256; y += 8) {
          const x = (i * 37) % 256 + Math.sin(y * 0.035 + i) * 2;
          if (y === 0) brush.moveTo(x, y);
          else brush.lineTo(x, y);
        }
        brush.stroke();
      }
      const texture = new THREE.CanvasTexture(grain);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(width / 1.4, depth / 1.4);
      textures.add(texture);
      floor.map = texture;
      floor.color.setHex(0xffffff);
    }
    const floorMesh = plane(width, depth, floor, 0, -0.109, 0);
    floorMesh.rotation.x = -Math.PI / 2;
    if (warm) {
      // Fine board joints and alternating grain provide scale without downloads.
      for (let x = left + 0.28; x < width / 2; x += 0.28) {
        box(0.007, 0.002, depth, joint, x, -0.107, 0);
      }
      for (let row = 0; row < width / 0.28; row += 1) {
        const x = left + row * 0.28 + 0.14;
        for (let z = back + 0.6 + (row % 3) * 0.5; z < depth / 2; z += 1.8) {
          box(0.27, 0.002, 0.006, joint, x, -0.107, z);
        }
      }
    } else {
      for (let x = left + 0.9; x < width / 2; x += 0.9) box(0.006, 0.002, depth, joint, x, -0.107, 0);
      for (let z = back + 0.9; z < depth / 2; z += 0.9) box(width, 0.002, 0.006, joint, 0, -0.107, z);
    }
    backWall = new THREE.Group();
    sideWall = new THREE.Group();
    root.add(backWall, sideWall);
    plane(width, height, plaster, 0, height / 2 - 0.11, back, backWall);
    const side = plane(depth, height, plaster, left, height / 2 - 0.11, 0, sideWall);
    side.rotation.y = Math.PI / 2;
    box(width, 0.075, 0.025, fabric, 0, -0.065, back + 0.014, backWall);
    box(0.025, 0.075, depth, fabric, left + 0.014, -0.065, 0, sideWall);

    // A glazed opening, low joinery and art sit outside the stair envelope.
    const windowWidth = Math.min(2.2, width * 0.3);
    const windowX = width / 2 - windowWidth / 2 - 0.4;
    const glazing = material(0xc9dfdf, { emissive: 0xb2d2d4, emissiveIntensity: 0.22, roughness: 0.22 });
    plane(windowWidth + 0.12, 2.25, fabric, windowX, 1.75, back + 0.012, backWall);
    plane(windowWidth, 2.13, glazing, windowX, 1.75, back + 0.022, backWall);
    box(0.035, 2.14, 0.04, dark, windowX, 1.75, back + 0.045, backWall);
    box(windowWidth, 0.035, 0.04, dark, windowX, 1.55, back + 0.045, backWall);
    const artX = Math.max(left + 1.1, bounds.min.x - 0.8);
    plane(1.3, 1.6, timber, artX, 1.95, back + 0.022, backWall);
    plane(1.2, 1.5, fabric, artX, 1.95, back + 0.03, backWall);
    const art = plane(0.66, 0.86, accent, artX - 0.12, 2.02, back + 0.04, backWall);
    art.rotation.z = -0.12;
    const artCircle = mesh(new THREE.CircleGeometry(0.29, 32), timber, artX + 0.22, 1.64, back + 0.05, backWall);
    artCircle.castShadow = false;
    box(1.75, 0.57, 0.44, warm ? timber : accent, artX, 0.22, back + 0.31);
    box(1.8, 0.04, 0.48, timber, artX, 0.52, back + 0.31);

    const furnitureX = bounds.min.x - 1.12;
    const furnitureZ = Math.min(0.4, bounds.max.z - 0.3);
    if (business) {
      // Reception / workspace: a desk, seat and discreet timber wall slats.
      box(1.2, 0.055, 1.8, timber, furnitureX, 0.69, furnitureZ);
      for (const dx of [-0.48, 0.48]) for (const dz of [-0.72, 0.72]) box(0.04, 0.8, 0.04, dark, furnitureX + dx, 0.29, furnitureZ + dz);
      box(0.48, 0.035, 0.04, dark, furnitureX, 0.735, furnitureZ - 0.22);
      box(0.52, 0.34, 0.025, dark, furnitureX, 1, furnitureZ - 0.22);
      box(0.04, 0.17, 0.04, dark, furnitureX, 0.82, furnitureZ - 0.22);
      box(0.49, 0.12, 0.5, accent, furnitureX, 0.38, furnitureZ + 0.94);
      box(0.49, 0.5, 0.07, accent, furnitureX, 0.67, furnitureZ + 1.16);
      for (const dx of [-0.18, 0.18]) for (const dz of [-0.18, 0.18]) box(0.03, 0.43, 0.03, dark, furnitureX + dx, 0.105, furnitureZ + 0.94 + dz);
      for (let i = 0; i < 12; i += 1) box(0.04, height, 0.035, timber, left + 0.22 + i * 0.075, height / 2 - 0.1, back + 0.04, backWall);
    } else {
      const rug = plane(1.75, 2.7, material(warm ? 0xe2d7bd : 0xb4b8ac), furnitureX, -0.103, furnitureZ);
      rug.rotation.x = -Math.PI / 2;
      // A compact sofa leaves a clear passage around every stair shape.
      box(0.86, 0.18, 1.85, timber, furnitureX, 0.03, furnitureZ);
      for (const dx of [-0.3, 0.3]) for (const dz of [-0.7, 0.7]) box(0.06, 0.05, 0.06, dark, furnitureX + dx, -0.085, furnitureZ + dz);
      box(0.85, 0.22, 1.73, fabric, furnitureX + 0.04, 0.24, furnitureZ);
      box(0.18, 0.69, 1.85, fabric, furnitureX - 0.38, 0.38, furnitureZ);
      for (const dz of [-0.87, 0.87]) box(0.95, 0.45, 0.16, fabric, furnitureX, 0.26, furnitureZ + dz);
      const cushion = box(0.27, 0.4, 0.43, accent, furnitureX - 0.12, 0.51, furnitureZ - 0.4);
      cushion.rotation.z = -0.2;
      mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.045, 36), timber, furnitureX, 0.44, furnitureZ + 1.45);
      mesh(new THREE.CylinderGeometry(0.08, 0.13, 0.55, 24), dark, furnitureX, 0.14, furnitureZ + 1.45);
    }
    plant(bounds.max.x + 0.86, Math.max(back + 0.6, bounds.min.z - 0.35), business ? 1.3 : 1.05);
    // Shaded lamp and practical warm light add depth without another shadow map.
    const lampX = left + 0.52;
    const lampZ = Math.max(back + 0.55, furnitureZ - 1.55);
    mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.035, 24), dark, lampX, -0.0915, lampZ);
    mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.7, 12), dark, lampX, 0.77, lampZ);
    mesh(new THREE.CylinderGeometry(0.18, 0.33, 0.38, 32, 1, true), material(0xf2e5cc, { side: THREE.DoubleSide, emissive: 0xffd7a0, emissiveIntensity: warm ? 0.35 : 0.1 }), lampX, 1.65, lampZ);
    const lamp = new THREE.PointLight(warm ? 0xffcb8c : 0xffe7bc, warm ? 3 : 1, 4, 2);
    lamp.position.set(lampX, 1.5, lampZ);
    root.add(lamp);
  }
  return {
    build,
    update(camera) {
      // Cutaway walls and attached decoration disappear when viewed from
      // outside, rather than hiding the stair during a 360-degree orbit.
      if (backWall) backWall.visible = camera.position.z > back + 0.03;
      if (sideWall) sideWall.visible = camera.position.x > left + 0.03;
    },
    dispose() { clear(); scene.remove(root); },
  };
}
