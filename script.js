// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.CubeTextureLoader().load([
  'stars.jpg', 'stars.jpg',
  'stars.jpg', 'stars.jpg',
  'stars.jpg', 'stars.jpg'
]);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.set(0, 400, 800);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.zoomSpeed = 0.5;

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Helper function to create a planet
function createPlanet(name, size, distance, color, speed, tilt = 0) {
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;

  const orbit = new THREE.Object3D();
  orbit.add(mesh);

  scene.add(orbit);

  return {
    name,
    mesh,
    orbit,
    distance,
    speed,
    angle: Math.random() * Math.PI * 2,
    tilt
  };
}

// Starfield background (stars.jpg should be a tileable star texture)
const starTexture = new THREE.TextureLoader().load('stars.jpg');
scene.background = starTexture;

// Sun
const sunGeo = new THREE.SphereGeometry(40, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Planets
const planets = [
  createPlanet('Mercury', 4, 60, 0x888888, 0.004),
  createPlanet('Venus', 7, 90, 0xd4af37, 0.002),
  createPlanet('Earth', 8, 130, 0x3399ff, 0.001),
  createPlanet('Mars', 6, 170, 0xff3300, 0.0008),
  createPlanet('Jupiter', 15, 220, 0xffa500, 0.0005),
  createPlanet('Saturn', 13, 270, 0xffff99, 0.0003),
  createPlanet('Uranus', 11, 320, 0x99ccff, 0.0002),
  createPlanet('Neptune', 11, 370, 0x3366ff, 0.0001),
  createPlanet('Pluto', 3, 410, 0xbbbbbb, 0.00005)
];

// Add Galilean moons to Jupiter
const jupiter = planets.find(p => p.name === 'Jupiter');
jupiter.moons = [
  createPlanet('Io', 2, 20, 0xddaa66, 0.01),
  createPlanet('Europa', 1.8, 28, 0xcccccc, 0.008),
  createPlanet('Ganymede', 2.2, 36, 0xbbbbbb, 0.006),
  createPlanet('Callisto', 2.1, 45, 0xaaaaaa, 0.004)
];

// Attach moons to Jupiter
jupiter.moons.forEach(moon => {
  jupiter.mesh.add(moon.mesh);
});

// Add asteroid belt
function addAsteroidBelt(innerRadius, outerRadius, count) {
  const geometry = new THREE.SphereGeometry(0.5, 4, 4);
  const material = new THREE.MeshStandardMaterial({ color: 0x888888 });

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = THREE.MathUtils.lerp(innerRadius, outerRadius, Math.random());
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const y = (Math.random() - 0.5) * 5;
    const asteroid = new THREE.Mesh(geometry, material);
    asteroid.position.set(x, y, z);
    scene.add(asteroid);
  }
}
addAsteroidBelt(190, 215, 300);

// Labels
const labels = {};
const loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
  planets.forEach(planet => {
    const textGeo = new THREE.TextGeometry(planet.name, {
      font,
      size: 5,
      height: 1
    });
    const textMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const label = new THREE.Mesh(textGeo, textMat);
    label.position.set(planet.distance, 10, 0);
    scene.add(label);
    labels[planet.name] = label;
  });
});

// Animate
function animate() {
  requestAnimationFrame(animate);

  // Rotate planets
  planets.forEach(p => {
    p.angle += p.speed;
    const x = Math.cos(p.angle) * p.distance;
    const z = Math.sin(p.angle) * p.distance;
    p.orbit.position.set(x, 0, z);
  });

  renderer.render(scene, camera);
}
animate();

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
