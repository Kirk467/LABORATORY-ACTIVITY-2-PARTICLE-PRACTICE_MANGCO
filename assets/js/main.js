import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  10,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
let nameMesh;
let knives, knifeGeo;
let knifeMaterial;
const particleColors = [
  new THREE.Color(0x1101ed),
  new THREE.Color(0xf51a1c),
  new THREE.Color(0x2de048),
];
const colorTransitionDuration = 3;
const colorCycleStart = performance.now();

lighting();
createName();
particles();

function particles() {
  const points = [];

  for (let i = 0; i < 3000; i++) {
    let knife = new THREE.Vector3(
      Math.random() * 600 - 300,
      Math.random() * 600 - 300,
      Math.random() * 600 - 300
    );
    points.push(knife);
  }

  knifeGeo = new THREE.BufferGeometry().setFromPoints(points);

  const sprite = new THREE.TextureLoader().load("assets/images/knife.png");
  sprite.colorSpace = THREE.SRGBColorSpace;
  const background = new THREE.TextureLoader().load("assets/images/triare.png");
  background.colorSpace = THREE.SRGBColorSpace;
  scene.background = background;

  knifeMaterial = new THREE.PointsMaterial({
    color: particleColors[0],
    size: 15,
    map: sprite,
    transparent: true,
    alphaTest: 0.1,
    depthWrite: false,
  });

  knives = new THREE.Points(knifeGeo, knifeMaterial);
  scene.add(knives);
}

function animateParticles() {
  const positions = knifeGeo.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const yIndex = i * 3 + 1;
    let y = positions.array[yIndex] - 0.9;

    if (y < -300) {
      y += 600;
    }

    positions.array[yIndex] = y;
  }

  positions.needsUpdate = true;
}

function createName() {
  camera.position.z = 15;

  new FontLoader().load(
    "./assets/font/Victorian Decade Demo Version_Regular.json",
    (font) => {
      const texture = new THREE.TextureLoader().load(
        "assets/textures/wooden.jpg"
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const geometry = new TextGeometry("Kirk", {
        font,
        size: 5,
        depth: 1.5,
        curveSegments: 8,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelSegments: 10,
      });
      geometry.center();

      nameMesh = new THREE.Mesh(geometry, material);
      nameMesh.position.z = -5;
      scene.add(nameMesh);
    }
  );
}

function lighting() {
  const light = new THREE.HemisphereLight(0x780a44, 0x1c3020, 1);
  scene.add(light);

  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, 0, 15);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 500;
  spotLight.shadow.camera.far = 4000;
  spotLight.shadow.camera.fov = 30;
  scene.add(spotLight);
}

function animate() {
  requestAnimationFrame(animate);

  animateParticles();

  const cyclePosition =
    (((performance.now() - colorCycleStart) / 1000) /
      colorTransitionDuration) %
    particleColors.length;
  const colorIndex = Math.floor(cyclePosition);
  const colorProgress = cyclePosition - colorIndex;
  knifeMaterial.color
    .copy(particleColors[colorIndex])
    .lerp(particleColors[(colorIndex + 1) % particleColors.length], colorProgress);

  if (nameMesh) {
    nameMesh.rotation.x += 0.002;
    nameMesh.rotation.y += 0.002;
  }
  renderer.render(scene, camera);
}

animate();
