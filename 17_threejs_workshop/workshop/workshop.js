let parameters = {};

// SCENE
let scene = new THREE.Scene();
scene.background = new THREE.Color('#a6a6a6');
scene.fog = new THREE.FogExp2(scene.background, 0.02);

// CAMERA
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

// RENDERER
let renderer = new THREE.WebGLRenderer({  alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

// make sure the scene adjusts to the browser window size
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// CONTROLS FOR NAVIGATION
let controls = new THREE.OrbitControls(camera, renderer.domElement);

// LIGHTING
// AMBIENT
let ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// POINT LIGHT
let pointLight = new THREE.PointLight(0xc9efff, 0.8);
pointLight.position.set(0, 4, 2);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 1;
pointLight.shadow.camera.far = 600;
pointLight.shadow.radius = 10;
scene.add(pointLight);

const sphereSize = 1;
const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
scene.add(pointLightHelper);

// GEOMETRY
// PLANE
let planeGeometry = new THREE.PlaneBufferGeometry(300, 300);
let planeMaterial = new THREE.MeshPhongMaterial({ color: '#9c9595', depthWrite: false });
let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2;
planeMesh.position.y = -10;
planeMesh.receiveShadow = true;
scene.add(planeMesh);

// ICOSAHEDRON
let geometry = new THREE.IcosahedronGeometry(1.5, 0); //radius, detail
let material = new THREE.MeshPhongMaterial({ color: 0xaa5e82, roughness: 0 });
let icosa = new THREE.Mesh(geometry, material);
icosa.castShadow = true;
scene.add(icosa);

// ICOSAHEDRON 2
let icosaGeometry_2 = new THREE.IcosahedronGeometry(2.0, 0); //radius, detail
let material_2 = new THREE.MeshPhongMaterial({ color: 0x2d2d2d, wireframe: true });
let icosa_2 = new THREE.Mesh(icosaGeometry_2, material_2);
scene.add(icosa_2);

// GUI
function createGUI() {
    let gui = new dat.GUI({ width: 300 });

    // default parameter settings
    parameters = {
        material: material.color.getHex(),
        roughness: material.roughness,
        geometry_motion: false,
        positionX: icosa.position.x,
        positionY: icosa.position.y,
        positionZ: icosa.position.z,
        motion: false,
        color: pointLight.color.getHex(),
        intensity: pointLight.intensity,
        ambient: ambientLight.intensity,
    };

    gui.open();

    // GUI Folder with geometry elements
    let geoFolder = gui.addFolder('Geometry');
    geoFolder.addColor(parameters, 'material').onChange(function (val) {
        material.color.setHex(val);
    });
    geoFolder.add(parameters, 'roughness', 0, 1.0).onChange(function (val) {
        material.roughness = val;
    });
    geoFolder.add(parameters, 'geometry_motion');
    geoFolder.add(parameters, 'positionX', -4.0, 4.0).onChange(function (val) {
        icosa.position.x = val;
    });
    geoFolder.add(parameters, 'positionY', -4.0, 4.0).onChange(function (val) {
        icosa.position.y = val;
    });
    geoFolder.add(parameters, 'positionZ', -4.0, 4.0).onChange(function (val) {
        icosa.position.z = val;
    });
    geoFolder.open();

    // GUI Folder with light elements
    let lightFolder = gui.addFolder('Light');
    lightFolder.add(parameters, 'motion');
    lightFolder.addColor(parameters, 'color').onChange(function (val) {
        pointLight.color.setHex(val);
    });
    lightFolder.add(parameters, 'intensity', 0, 2.0).onChange(function (val) {
        pointLight.intensity = val;
    });
    lightFolder.add(parameters, 'ambient', 0, 1.0).onChange(function (val) {
        ambientLight.intensity = val;
    });
    lightFolder.open();
}

// ANIMATE/RENDER like draw() in p5
function animate() {
    requestAnimationFrame(animate);

    if (parameters.geometry_motion) {
        icosa.rotation.x += 0.004;
        icosa.rotation.y += 0.007;
        icosa_2.rotation.x += 0.008;
        icosa_2.rotation.z += 0.005;
    }

    if (parameters.motion) {
        const t = Date.now() / 3000;
        // move light in circle around center
        // change light height with sine curve
        const r = 3.0;
        const lx = r * Math.cos(t);
        const lz = r * Math.sin(t);
        const ly = pointLight.position.y; //2 + 2 * Math.sin(t / 3.0);
        pointLight.position.set(lx, ly, lz);
    }

    controls.update();
    renderer.render(scene, camera);
}
createGUI();
animate();
