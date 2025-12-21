// Fetch copyright text from main.txt ONLY
async function fetchCopyrightText() {
    try {
        const response = await fetch('https://cdn.realmaz.ggff.net/main.txt');
        const text = await response.text();
        document.getElementById('copyright-text').textContent = text.trim();
    } catch (error) {
        console.error('Error fetching copyright text:', error);
        // No fallback text - text ONLY comes from the URL
        document.getElementById('copyright-text').textContent = '';
    }
}

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Camera position
camera.position.set(0, 15, 40);
camera.lookAt(0, 0, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Create starfield background with color variation
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.5,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const starsVertices = [];
    const starsColors = [];
    
    for (let i = 0; i < 15000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
        
        const color = new THREE.Color();
        color.setHSL(0.6 + Math.random() * 0.2, 0.5, 0.5 + Math.random() * 0.5);
        starsColors.push(color.r, color.g, color.b);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
    
    starsMaterial.vertexColors = true;
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    return stars;
}

// Create sun with detailed surface and glow effects
function createSun() {
    const sunGroup = new THREE.Group();
    
    // Main sun body
    const sunGeometry = new THREE.SphereGeometry(3, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffdd88,
        emissive: 0xffaa00,
        emissiveIntensity: 0.3
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sunGroup.add(sun);
    
    // Multiple glow layers for better effect
    const glowLayers = [
        { size: 3.3, color: 0xff8800, opacity: 0.6 },
        { size: 3.8, color: 0xff4400, opacity: 0.3 },
        { size: 4.5, color: 0xff0000, opacity: 0.1 }
    ];
    
    glowLayers.forEach(layer => {
        const glowGeometry = new THREE.SphereGeometry(layer.size, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: layer.color,
            transparent: true,
            opacity: layer.opacity,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        sunGroup.add(glow);
    });
    
    // Add solar flares effect
    const flareGeometry = new THREE.SphereGeometry(3.1, 32, 32);
    const flareMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.4,
        wireframe: true
    });
    const flares = new THREE.Mesh(flareGeometry, flareMaterial);
    sunGroup.add(flares);
    
    scene.add(sunGroup);
    return { group: sunGroup, mesh: sun, flares: flares };
}

// Planet data with realistic proportions and colors
const planetsData = [
    { name: 'Mercury', radius: 0.4, distance: 7, color: 0x888888, speed: 0.02 },
    { name: 'Venus', radius: 0.7, distance: 9, color: 0xffc649, speed: 0.015 },
    { name: 'Earth', radius: 0.8, distance: 12, color: 0x4488ff, speed: 0.01 },
    { name: 'Mars', radius: 0.6, distance: 15, color: 0xff4444, speed: 0.008 },
    { name: 'Jupiter', radius: 2.2, distance: 22, color: 0xffaa44, speed: 0.005 },
    { name: 'Saturn', radius: 2.0, distance: 28, color: 0xffdd88, speed: 0.003 },
    { name: 'Uranus', radius: 1.2, distance: 35, color: 0x88ffff, speed: 0.002 },
    { name: 'Neptune', radius: 1.1, distance: 40, color: 0x4444ff, speed: 0.001 }
];

// Create planets with detailed geometry and materials
function createPlanets() {
    const planets = [];

    planetsData.forEach((data, index) => {
        const planetGroup = new THREE.Group();
        
        // Planet
        const planetGeometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const planetMaterial = new THREE.MeshLambertMaterial({ 
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 0.05
        });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        
        // Add some variation to planet surfaces
        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
        planetGroup.add(planetMesh);
        
        // Saturn's rings
        if (data.name === 'Saturn') {
            const ringGeometry = new THREE.RingGeometry(data.radius * 1.3, data.radius * 2, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xaaaaaa,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.6
            });
            const rings = new THREE.Mesh(ringGeometry, ringMaterial);
            rings.rotation.x = Math.PI / 2;
            planetGroup.add(rings);
            
            // Add ring particles
            const ringParticlesGeometry = new THREE.RingGeometry(data.radius * 1.2, data.radius * 2.1, 32);
            const ringParticlesMaterial = new THREE.MeshBasicMaterial({
                color: 0xaaaaaa,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.2,
                wireframe: true
            });
            const ringParticles = new THREE.Mesh(ringParticlesGeometry, ringParticlesMaterial);
            ringParticles.rotation.x = Math.PI / 2;
            planetGroup.add(ringParticles);
        }
        
        // Orbit path
        const orbitGeometry = new THREE.RingGeometry(data.distance - 0.02, data.distance + 0.02, 128);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0x444444,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
        
        planetGroup.add(planet);
        planetGroup.position.x = data.distance;
        
        scene.add(planetGroup);
        
        planets.push({
            group: planetGroup,
            mesh: planet,
            data: data,
            angle: Math.random() * Math.PI * 2 // Random starting position
        });
    });

    return planets;
}

// Create asteroid belt with varied sizes and shapes
function createAsteroidBelt() {
    const asteroids = [];
    const asteroidCount = 200;
    
    for (let i = 0; i < asteroidCount; i++) {
        const size = Math.random() * 0.1 + 0.05;
        const asteroidGeometry = new THREE.SphereGeometry(size, 8, 8);
        const asteroidMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x666666 
        });
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        
        const distance = 18 + Math.random() * 3;
        const angle = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 0.5;
        
        asteroid.position.x = Math.cos(angle) * distance;
        asteroid.position.z = Math.sin(angle) * distance;
        asteroid.position.y = y;
        
        scene.add(asteroid);
        asteroids.push({
            mesh: asteroid,
            distance: distance,
            angle: angle,
            speed: 0.001 + Math.random() * 0.001
        });
    }
    
    return asteroids;
}

// Mouse controls
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Scroll controls
let scrollY = 0;
document.addEventListener('wheel', (event) => {
    scrollY += event.deltaY * 0.01;
    scrollY = Math.max(-20, Math.min(50, scrollY));
});

// Initialize scene objects
const stars = createStars();
const sun = createSun();
const planets = createPlanets();
const asteroids = createAsteroidBelt();

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate stars slowly
    stars.rotation.y += 0.0002;

    // Animate sun with rotation and flare effects
    sun.mesh.rotation.y += 0.005;
    sun.flares.rotation.x += 0.01;
    sun.flares.rotation.z -= 0.005;

    // Animate planets with orbital motion
    planets.forEach((planet) => {
        planet.angle += planet.data.speed;
        planet.group.position.x = Math.cos(planet.angle) * planet.data.distance;
        planet.group.position.z = Math.sin(planet.angle) * planet.data.distance;
        planet.mesh.rotation.y += 0.02;
        
        // Add slight wobble to planets
        planet.group.position.y = Math.sin(planet.angle * 2) * 0.1;
    });

    // Animate asteroids
    asteroids.forEach((asteroid) => {
        asteroid.angle += asteroid.speed;
        asteroid.mesh.position.x = Math.cos(asteroid.angle) * asteroid.distance;
        asteroid.mesh.position.z = Math.sin(asteroid.angle) * asteroid.distance;
        asteroid.mesh.rotation.x += 0.01;
        asteroid.mesh.rotation.y += 0.01;
    });

    // Smooth camera controls
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    camera.position.x = targetX * 15;
    camera.position.y = 15 + targetY * 10 + scrollY;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation and fetch copyright text
fetchCopyrightText();
animate();

// Add loading animation
window.addEventListener('load', () => {
    document.querySelector('.center-text-container').style.opacity = '0';
    document.querySelector('.center-text-container').style.transform = 'translate(-50%, -50%) scale(0.8)';
    
    setTimeout(() => {
        document.querySelector('.center-text-container').style.transition = 'all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        document.querySelector('.center-text-container').style.opacity = '1';
        document.querySelector('.center-text-container').style.transform = 'translate(-50%, -50%) scale(1)';
    }, 500);
});
