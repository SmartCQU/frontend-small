import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./styles.css";

const canvas = document.querySelector("#field-canvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xedf7f7);
scene.fog = new THREE.Fog(0xedf7f7, 16, 42);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(9.6, 9.4, 11.4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.55, 0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.48;
controls.minDistance = 8;
controls.maxDistance = 22;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.22;

const FIELD = {
  width: 11.6,
  depth: 7.2,
  plantRows: 8,
  plantCols: 16,
  rowSpacing: 0.76,
  colSpacing: 0.69,
};

const materials = {
  soil: new THREE.MeshStandardMaterial({
    color: 0x7a644f,
    roughness: 0.95,
    metalness: 0.02,
  }),
  soilDark: new THREE.MeshStandardMaterial({
    color: 0x4f3f32,
    roughness: 1,
  }),
  soilLayer: new THREE.MeshStandardMaterial({
    color: 0x8b735a,
    roughness: 0.96,
  }),
  rowSoil: new THREE.MeshStandardMaterial({
    color: 0x5f6f4f,
    roughness: 0.96,
  }),
  furrow: new THREE.MeshStandardMaterial({
    color: 0x4b3b2e,
    roughness: 1,
  }),
  landTop: new THREE.MeshStandardMaterial({
    color: 0x6b563d,
    roughness: 0.98,
    metalness: 0,
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x65e0c5,
    roughness: 0.18,
    metalness: 0,
    transparent: true,
    opacity: 0.38,
    transmission: 0.18,
    thickness: 0.16,
    side: THREE.DoubleSide,
  }),
  glow: new THREE.MeshBasicMaterial({
    color: 0x21e2bf,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
  edgeGlow: new THREE.MeshBasicMaterial({
    color: 0x2bf0d3,
    transparent: true,
    opacity: 0.42,
  }),
  edgeCore: new THREE.MeshBasicMaterial({
    color: 0xa6fff0,
    transparent: true,
    opacity: 0.62,
  }),
  stem: new THREE.MeshStandardMaterial({
    color: 0x176f36,
    roughness: 0.7,
  }),
  leafA: new THREE.MeshStandardMaterial({
    color: 0x2d9a48,
    roughness: 0.75,
    side: THREE.DoubleSide,
  }),
  leafB: new THREE.MeshStandardMaterial({
    color: 0x78c857,
    roughness: 0.72,
    side: THREE.DoubleSide,
  }),
  leafDark: new THREE.MeshStandardMaterial({
    color: 0x176736,
    roughness: 0.82,
    side: THREE.DoubleSide,
  }),
  vein: new THREE.MeshBasicMaterial({
    color: 0xb9dd64,
    transparent: true,
    opacity: 0.72,
  }),
  tassel: new THREE.MeshStandardMaterial({
    color: 0xe6d7a5,
    roughness: 0.86,
  }),
  root: new THREE.MeshStandardMaterial({
    color: 0xb08349,
    roughness: 0.95,
  }),
  cob: new THREE.MeshStandardMaterial({
    color: 0xf1cf58,
    roughness: 0.68,
  }),
  husk: new THREE.MeshStandardMaterial({
    color: 0x7fbf5c,
    roughness: 0.8,
    side: THREE.DoubleSide,
  }),
  huskShell: new THREE.MeshStandardMaterial({
    color: 0x74ad55,
    roughness: 0.78,
  }),
  huskLight: new THREE.MeshStandardMaterial({
    color: 0xa8d95b,
    roughness: 0.78,
    side: THREE.DoubleSide,
  }),
  tile: new THREE.MeshStandardMaterial({
    color: 0xe7eeee,
    roughness: 0.62,
  }),
};

function makeNoiseTexture() {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i += 1) {
    const stride = i * 4;
    const value = 112 + Math.floor(Math.random() * 56);
    data[stride] = value;
    data[stride + 1] = value * 0.82;
    data[stride + 2] = value * 0.65;
    data[stride + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 7);
  texture.needsUpdate = true;
  return texture;
}

materials.soil.map = makeNoiseTexture();

function addLights() {
  const hemi = new THREE.HemisphereLight(0xf9ffff, 0x8aa09a, 2.2);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 3.4);
  sun.position.set(6, 12, 5);
  sun.castShadow = true;
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);

  const teal = new THREE.PointLight(0x48ffda, 3.2, 12);
  teal.position.set(-4, 2.2, 4);
  scene.add(teal);
}

function roundedBox(width, height, depth, radius, material) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -depth / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + depth - radius);
  shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth);
  shape.lineTo(x + radius, y + depth);
  shape.quadraticCurveTo(x, y + depth, x, y + depth - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelSize: 0.04,
    bevelThickness: 0.04,
    bevelSegments: 3,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -height / 2, 0);
  return new THREE.Mesh(geometry, material);
}

function createBase() {
  const group = new THREE.Group();
  const base = roundedBox(11.6, 1.05, 7.2, 0.18, materials.soil);
  base.position.y = -0.54;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const top = new THREE.Mesh(new THREE.BoxGeometry(11.25, 0.08, 6.86), materials.landTop);
  top.position.y = 0.04;
  top.receiveShadow = true;
  group.add(top);

  const rowCount = 6;
  const rowSpacing = 1.05;
  const startZ = -((rowCount - 1) * rowSpacing) / 2;
  for (let i = 0; i < rowCount; i += 1) {
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(10.15, 0.075, 0.18),
      i % 2 ? materials.rowSoil : materials.soilDark,
    );
    ridge.position.set(0, 0.1, startZ + i * rowSpacing);
    ridge.receiveShadow = true;
    group.add(ridge);
  }

  const edgeSpecs = [
    [11.72, 0.035, 0.04, 0, 0.15, -3.68],
    [11.72, 0.035, 0.04, 0, 0.15, 3.68],
    [0.04, 0.035, 7.42, -5.84, 0.15, 0],
    [0.04, 0.035, 7.42, 5.84, 0.15, 0],
  ];
  edgeSpecs.forEach(([w, h, d, x, y, z]) => {
    const edge = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materials.edgeGlow);
    edge.position.set(x, y, z);
    group.add(edge);
  });

  const border = new THREE.Mesh(
    new THREE.BoxGeometry(11.9, 0.08, 7.5),
    new THREE.MeshBasicMaterial({ color: 0x32e5c8, transparent: true, opacity: 0.14, wireframe: true }),
  );
  border.position.y = 0.12;
  group.add(border);

  return group;
}

function createLeaf(length, width, curve, material) {
  const segments = 9;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const taper = Math.sin(t * Math.PI) ** 0.58 * (1 - t * 0.1);
    const halfWidth = width * taper;
    const y = t * length;
    const z = Math.sin(t * Math.PI * 0.86) * curve - t * t * 0.1;

    positions.push(-halfWidth, y, z, halfWidth, y, z);
    uvs.push(0, t, 1, t);

    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const leaf = new THREE.Mesh(geometry, material);
  leaf.castShadow = true;
  return leaf;
}

function createHusk(length, width, material) {
  const leaf = createLeaf(length, width, 0.06, material);
  leaf.rotation.x = 0.64;
  return leaf;
}

function createWrappedEar(rng) {
  const group = new THREE.Group();

  const shell = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.068, 0.32, 6, 12),
    materials.huskShell,
  );
  shell.rotation.z = -0.06;
  shell.castShadow = true;
  group.add(shell);

  const kernels = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.042, 0.19, 5, 10),
    materials.cob,
  );
  kernels.position.set(0.024, 0.026, 0.06);
  kernels.rotation.z = -0.1;
  kernels.castShadow = true;
  group.add(kernels);

  for (let i = 0; i < 3; i += 1) {
    const husk = createHusk(0.34 + rng() * 0.1, 0.04 + rng() * 0.014, materials.husk);
    husk.position.set(0, -0.16 + i * 0.04, i === 1 ? 0.03 : 0);
    husk.rotation.y = i * 2.1 + rng() * 0.22;
    husk.rotation.z = -0.18 + (i - 1) * 0.22;
    group.add(husk);
  }

  const silk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.012, 0.16, 5),
    materials.tassel,
  );
  silk.position.y = 0.25;
  silk.rotation.z = -0.2;
  group.add(silk);

  return group;
}

function createCornPlant(seed = 1) {
  const rng = mulberry32(seed);
  const group = new THREE.Group();
  const height = 1.18 + rng() * 0.42;
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.055, height, 9),
    materials.stem,
  );
  stem.position.y = height * 0.5;
  stem.castShadow = true;
  group.add(stem);

  const leafCount = 5 + Math.floor(rng() * 2);
  for (let i = 0; i < leafCount; i += 1) {
    const level = 0.18 + (i / leafCount) * height * 0.78;
    const lowerLeafBoost = i < 3 ? 0.1 : 0;
    const leaf = createLeaf(
      0.48 + lowerLeafBoost + rng() * 0.24,
      0.085 + rng() * 0.052,
      0.07 + rng() * 0.14,
      rng() > 0.36 ? materials.leafA : materials.leafB,
    );
    leaf.position.y = level;
    leaf.rotation.order = "YXZ";
    leaf.rotation.y = (i / leafCount) * Math.PI * 3.4 + rng() * 0.42;
    leaf.rotation.x = 0.78 + rng() * 0.44;
    leaf.rotation.z = (rng() - 0.5) * 0.18;
    group.add(leaf);
  }

  if (rng() > 0.62) {
    const ear = createWrappedEar(rng);
    ear.position.set(0.082, height * 0.53, 0.014);
    ear.rotation.set(0.2, 0.08, -0.72);
    group.add(ear);
  }

  const tassel = new THREE.Group();
  const tasselCount = 4 + Math.floor(rng() * 3);
  for (let i = 0; i < tasselCount; i += 1) {
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.01, 0.32 + rng() * 0.08, 5), materials.tassel);
    branch.position.y = height + 0.16;
    branch.rotation.z = (i - (tasselCount - 1) / 2) * 0.16;
    branch.rotation.x = (rng() - 0.5) * 0.26;
    branch.rotation.y = rng() * Math.PI;
    tassel.add(branch);
  }
  group.add(tassel);

  const scale = 0.82 + rng() * 0.22;
  group.scale.setScalar(scale);
  group.rotation.y = rng() * Math.PI * 2;
  return group;
}

function createCornField() {
  const group = new THREE.Group();
  const rows = 8;
  const cols = 16;
  const rowSpacing = 0.76;
  const colSpacing = 0.69;
  const startX = -((cols - 1) * colSpacing) / 2;
  const startZ = -((rows - 1) * rowSpacing) / 2;
  let seed = 12;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const rng = mulberry32(seed++);
      if (rng() < 0.018) continue;
      const plant = createCornPlant(seed * 97);
      const rowOffset = row % 2 === 0 ? 0 : colSpacing * 0.28;
      plant.position.x = startX + col * colSpacing + rowOffset + (rng() - 0.5) * 0.16;
      plant.position.z = startZ + row * rowSpacing + (rng() - 0.5) * 0.14;
      plant.position.y = 0.07;
      group.add(plant);
    }
  }

  const canopyMat = new THREE.MeshBasicMaterial({
    color: 0x22b96a,
    transparent: true,
    opacity: 0.032,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const canopy = new THREE.Mesh(new THREE.PlaneGeometry(10.9, 6.15), canopyMat);
  canopy.rotation.x = -Math.PI / 2;
  canopy.position.y = 1.06;
  group.add(canopy);
  return group;
}

function createFieldLeaf(length, width, droop, wave, material) {
  const segments = 18;
  const positions = [];
  const indices = [];
  const centerPoints = [];

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const taper = Math.sin(t * Math.PI) ** 0.46 * (1 - t * 0.12);
    const halfWidth = width * taper;
    const x = t * length;
    const y = Math.sin(t * Math.PI * 0.88) * 0.18 - droop * t * t;
    const z = Math.sin(t * Math.PI * 2.2) * wave;
    positions.push(x, y, z - halfWidth, x, y, z + halfWidth);
    centerPoints.push(new THREE.Vector3(x, y + 0.006, z));

    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const group = new THREE.Group();
  const blade = new THREE.Mesh(geometry, material);
  blade.castShadow = true;
  group.add(blade);

  const vein = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(centerPoints),
    materials.vein,
  );
  group.add(vein);
  return group;
}

function createFieldWrappedEar() {
  const group = new THREE.Group();
  const profile = [
    new THREE.Vector2(0.018, -0.43),
    new THREE.Vector2(0.105, -0.34),
    new THREE.Vector2(0.145, -0.12),
    new THREE.Vector2(0.135, 0.18),
    new THREE.Vector2(0.088, 0.4),
    new THREE.Vector2(0.022, 0.51),
  ];
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 24), materials.huskShell);
  body.scale.set(0.92, 1, 0.68);
  body.castShadow = true;
  group.add(body);

  const silk = new THREE.Group();
  for (let i = 0; i < 8; i += 1) {
    const strand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.007, 0.2 + (i % 3) * 0.03, 5),
      materials.root,
    );
    strand.position.set(0, 0.56, 0);
    strand.rotation.z = (i - 3.5) * 0.1;
    strand.rotation.x = (i % 2 ? 1 : -1) * 0.08;
    strand.rotation.y = (i / 8) * Math.PI * 2;
    silk.add(strand);
  }
  group.add(silk);
  group.rotation.set(0.18, 0.08, -0.55);
  return group;
}

function createFieldEarJoint() {
  const group = new THREE.Group();
  const shank = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.046, 0.24, 8),
    materials.stem,
  );
  shank.position.set(0.1, 0, 0);
  shank.rotation.z = Math.PI / 2 - 0.08;
  shank.castShadow = true;
  group.add(shank);

  const collar = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), materials.huskShell);
  collar.position.set(0.02, -0.015, 0);
  collar.scale.set(1.1, 0.62, 0.82);
  collar.castShadow = true;
  group.add(collar);
  return group;
}

function createFieldTassel(height, seed = 1) {
  const group = new THREE.Group();
  const rng = mulberry32(seed);
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.026, 0.7, 7), materials.tassel);
  stalk.position.y = height + 0.26;
  stalk.castShadow = true;
  group.add(stalk);

  const branchSpecs = [
    [0, 0.54, 0],
    [-0.55, 0.46, 0.2],
    [0.55, 0.46, -0.18],
    [-0.92, 0.4, -0.12],
    [0.92, 0.4, 0.14],
    [-1.25, 0.33, 0.2],
    [1.25, 0.33, -0.2],
    [-1.55, 0.26, -0.1],
    [1.55, 0.26, 0.1],
  ];

  branchSpecs.forEach(([angle, len, zTilt], index) => {
    const branch = new THREE.Group();
    const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.012, len, 6), materials.tassel);
    axis.position.y = len * 0.5;
    branch.add(axis);

    for (let i = 0; i < 5; i += 1) {
      const grain = new THREE.Mesh(new THREE.CapsuleGeometry(0.01, 0.03, 3, 5), materials.tassel);
      grain.position.set((i % 2 ? 1 : -1) * 0.022, 0.08 + i * len * 0.13, 0);
      grain.rotation.z = (i % 2 ? -1 : 1) * 0.45;
      branch.add(grain);
    }

    branch.position.y = height + 0.18 + index * 0.012;
    branch.rotation.z = angle + (rng() - 0.5) * 0.08;
    branch.rotation.x = zTilt;
    branch.rotation.y = index * 0.55;
    group.add(branch);
  });

  return group;
}

function createFieldCornPlant(seed = 1) {
  const rng = mulberry32(seed);
  const group = new THREE.Group();
  const height = 3.02 + (rng() - 0.5) * 0.18;

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.095, height, 14), materials.stem);
  stem.position.y = height * 0.5;
  stem.castShadow = true;
  group.add(stem);

  const leafSpecs = [
    [0.36, 0.72, 0.13, 0.26, -2.62, materials.leafB],
    [0.52, 1.18, 0.18, 0.46, 1.75, materials.leafA],
    [0.64, 1.44, 0.22, 0.5, 0.46, materials.leafA],
    [0.94, 1.02, 0.16, 0.34, 0.98, materials.leafDark],
    [1.12, 1.04, 0.15, 0.32, 2.18, materials.leafA],
    [1.54, 1.34, 0.19, 0.38, -2.98, materials.leafB],
    [1.72, 1.12, 0.16, 0.34, -1.45, materials.leafDark],
    [1.84, 0.86, 0.13, 0.24, 0.92, materials.leafA],
    [2.12, 1.02, 0.14, 0.26, 2.94, materials.leafDark],
    [2.38, 0.88, 0.12, 0.22, -0.52, materials.leafB],
    [2.58, 0.7, 0.1, 0.18, 1.84, materials.leafA],
    [2.72, 0.62, 0.09, 0.16, 0.76, materials.leafB],
  ];

  leafSpecs.forEach(([level, length, width, droop, angle, material], index) => {
    const scaleNoise = 0.92 + rng() * 0.16;
    const leaf = createFieldLeaf(length * scaleNoise, width * scaleNoise, droop, 0.035 + index * 0.002, material);
    leaf.position.y = level * (height / 3.12);
    leaf.position.x = Math.cos(angle) * 0.055;
    leaf.position.z = Math.sin(angle) * 0.055;
    leaf.rotation.order = "YXZ";
    leaf.rotation.y = angle + (rng() - 0.5) * 0.18;
    leaf.rotation.x = 0.02;
    leaf.rotation.z = (index % 2 ? 0.13 : -0.12) + (rng() - 0.5) * 0.08;
    group.add(leaf);
  });

  const earJoint = createFieldEarJoint();
  earJoint.position.set(0.07, 1.38 * (height / 3.12), 0.025);
  group.add(earJoint);

  const earSupportLeaf = createFieldLeaf(0.58, 0.1, 0.18, 0.014, materials.leafB);
  earSupportLeaf.position.set(0.052, 1.12 * (height / 3.12), 0.02);
  earSupportLeaf.rotation.order = "YXZ";
  earSupportLeaf.rotation.y = -0.18;
  earSupportLeaf.rotation.x = 0.02;
  earSupportLeaf.rotation.z = 0.08;
  group.add(earSupportLeaf);

  const ear = createFieldWrappedEar();
  ear.position.set(0.27, 1.52 * (height / 3.12), 0.045);
  ear.rotation.z -= 0.12;
  group.add(ear);

  group.add(createFieldTassel(height, seed + 11));
  const scale = 0.48 + rng() * 0.08;
  group.scale.setScalar(scale);
  group.rotation.y = rng() * Math.PI * 2;
  return group;
}

function createCornFieldV2() {
  const group = new THREE.Group();
  const rows = 6;
  const cols = 11;
  const rowSpacing = 1.05;
  const colSpacing = 0.93;
  const startX = -((cols - 1) * colSpacing) / 2;
  const startZ = -((rows - 1) * rowSpacing) / 2;
  let seed = 120;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const plant = createFieldCornPlant(seed * 97);
      plant.position.x = startX + col * colSpacing;
      plant.position.z = startZ + row * rowSpacing;
      plant.position.y = 0.09;
      group.add(plant);
      seed += 1;
    }
  }

  return group;
}

function createGroundGrid() {
  const group = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(52, 36), materials.tile);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.08;
  ground.receiveShadow = true;
  group.add(ground);

  const lineMat = new THREE.LineBasicMaterial({ color: 0xc9d7d7, transparent: true, opacity: 0.78 });
  for (let i = -18; i <= 18; i += 3) {
    const v = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, -1.065, -18),
      new THREE.Vector3(i, -1.065, 18),
    ]);
    const h = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-26, -1.064, i),
      new THREE.Vector3(26, -1.064, i),
    ]);
    group.add(new THREE.Line(v, lineMat), new THREE.Line(h, lineMat));
  }
  return group;
}

function createMarker() {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.018, 8, 36),
    new THREE.MeshBasicMaterial({ color: 0x22e7d1 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.13;
  group.add(ring);

  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.08, 1.1, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x2fffe1, transparent: true, opacity: 0.2, side: THREE.DoubleSide }),
  );
  beam.position.y = 0.68;
  group.add(beam);
  group.position.set(3.75, 0, 2.45);
  return group;
}

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

addLights();
scene.add(createBase());
scene.add(createCornFieldV2());

function resize() {
  const { clientWidth, clientHeight } = renderer.domElement;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight, false);
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resize();
animate();
window.addEventListener("resize", resize);
