import * as THREE from "three";

var keyboard = {};
var mesh;
var renderer;
var camera;
var scene;
var light;
var character = {height: 1.8, speed:0.2, turnSpeed:Math.PI*0.02};
var floorMesh;

function init() {
    scene = new THREE.Scene();
    const geometry = new THREE.SphereGeometry(10, 20, 20);
    const material = new THREE.MeshStandardMaterial({
        color: "#C0E61D",
        wireframe:true
       // metalness: 0.0
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = character.height + 10;
    scene.add(mesh);

   //ground needs texture
    const floorGeometry = new THREE.PlaneGeometry(150, 10000); // Adjust the size as needed
    const floorMaterial = new THREE.MeshBasicMaterial({ color: "#6F4E37", wireframe:true });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2; // Rotate the floor to be horizontal
    scene.add(floor);




    //light need to create sun object
    light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(0, 5, 35); //x, y, z
    scene.add(light);


    //camera
    camera = new THREE.PerspectiveCamera(90, 1280 / 720, 0.1, 1000);
    camera.position.set(0, 20, 90);
    camera.lookAt(new THREE.Vector3(0, character.height, 0));
    scene.add(camera);

    //render
    const canvas = document.querySelector(".webgl");
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(1520, 750);
    renderer.render(scene, camera);

    // Create a skybox
    const spaceTexture = new THREE.TextureLoader().load('space.jpg');
    const spaceBackground = new THREE.Mesh(
        new THREE.BoxGeometry(1000, 1000, 1000),
        new THREE.MeshBasicMaterial({ map: spaceTexture, side: THREE.BackSide })
    );
    scene.add(spaceBackground);

    // Generating stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff });
    const starsCount = 10000;

    const starsPositions = [];
    for (let i = 0; i < starsCount; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsPositions.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Set up keyboard event listeners
    window.addEventListener("keydown", (event) => {
        keyboard[event.keyCode] = true;
    });

    window.addEventListener("keyup", (event) => {
        keyboard[event.keyCode] = false;
    });

    animate();
}

// Function to animate the scene
function animate() {
    requestAnimationFrame(animate);

    // Automatic forward movement
    mesh.position.z -= character.speed;
    mesh.rotation.x -= .31;

    // Update the camera's position to follow the object
    camera.position.set(mesh.position.x, mesh.position.y + 20, mesh.position.z + 90);

    // Adjust the camera rotation based on keyboard input
    if (keyboard[37]) { // left key
        camera.rotation.y += character.turnSpeed;
    }

    if (keyboard[39]) { // right key
        camera.rotation.y -= character.turnSpeed;
    }

    //Adjust OBJECT positon
    if(keyboard[65]){
        mesh.position.x -= character.speed * 5;
    }

    if(keyboard[68]){
        mesh.position.x += character.speed * 5;
    }

    renderer.render(scene, camera);
}

// Set up keyboard event listeners
window.addEventListener("keydown", (event) => {
    keyboard[event.keyCode] = true;
});

window.addEventListener("keyup", (event) => {
    keyboard[event.keyCode] = false;
});

window.onload = init;




