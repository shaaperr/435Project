import * as THREE from "three";

var keyboard = {};
var mesh;
var renderer;
var camera;
var scene;
var light;
var character = {height: 1.8, speed:0.2, turnSpeed:Math.PI*0.02};
var floorMesh;
var floorLength = 15000;
var isJumping = false;
var jumpHeight = 40; 
var isFalling = false;
let score = 0;
let highScore = 0;

// Set interval to update score every 5000 milliseconds (5 seconds)
setInterval(updateScore, 2000);


function init() {
    scene = new THREE.Scene();
      const baseColorTexture = new THREE.TextureLoader().load("./metallic/Metal_006_basecolor.jpg");
    const normalMapTexture = new THREE.TextureLoader().load("./metallic/Metal_006_normal.jpg");
    const roughnessMapTexture = new THREE.TextureLoader().load("./metallic/Metal_006_roughness.jpg");
    const metallicMapTexture = new THREE.TextureLoader().load("./metallic/Metal_006_metallic.jpg");
    const heightMapTexture = new THREE.TextureLoader().load("./metallic/Metal_006_height.jpg");
    const ambientMapTexture = new THREE.TextureLoader().load("./metallic/Metal_006_ambientOcclusion.jpg");
    const geometry = new THREE.SphereGeometry(10, 20, 20);
    const material = new THREE.MeshStandardMaterial({
       // color: "#C0E61D",
        map: baseColorTexture,
        normalMap: normalMapTexture,
        roughnessMap: roughnessMapTexture,
        metalnessMap: metallicMapTexture,
        aoMap: ambientMapTexture,
        displacementMap: heightMapTexture,
        displacementScale: 0.2,
        
       // wireframe:true
       // metalness: 0.0
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = character.height + 10;
    scene.add(mesh);

   //ground needs texture
   const floorGeometry = new THREE.PlaneGeometry(150, floorLength); // Adjust the size as needed
   const stonePathTexture = new THREE.TextureLoader().load("./textures/stone-texture.jpg");
   stonePathTexture.wrapT = THREE.RepeatWrapping;
   stonePathTexture.wrapS = THREE.MirroredRepeatWrapping;
   stonePathTexture.repeat.set(2,400); // adjust right value as needed
   const floorMaterial = new THREE.MeshBasicMaterial({
       color: "#6F4E37",
       //wireframe: true, // doesn't show texture if true
       map: stonePathTexture
   });
   const floor = new THREE.Mesh(floorGeometry, floorMaterial);
   floor.rotation.x = 3 * Math.PI / 2; // Rotate the floor to be horizontal
   scene.add(floor);

    const leftLineMaterial = new THREE.LineBasicMaterial({color: 0x000000});
    const leftLinePoints = [];
    leftLinePoints.push(new THREE.Vector3(-(150 / 3) / 2, 0.2, -floorLength / 2));
    leftLinePoints.push(new THREE.Vector3(-(150 / 3) / 2, 0.2, floorLength / 2));
    const leftLineGeometry = new THREE.BufferGeometry().setFromPoints(leftLinePoints);
    const leftLine = new THREE.Line(leftLineGeometry, leftLineMaterial);
    scene.add(leftLine);

    const rightLineMaterial = new THREE.LineBasicMaterial({color: 0x000000});
    const rightLinePoints = [];
    rightLinePoints.push(new THREE.Vector3((150 / 3) / 2, 0.2, -floorLength / 2));
    rightLinePoints.push(new THREE.Vector3((150 / 3) / 2, 0.2, floorLength / 2));
    const rightLineGeometry = new THREE.BufferGeometry().setFromPoints(rightLinePoints);
    const rightLine = new THREE.Line(rightLineGeometry, rightLineMaterial);
    scene.add(rightLine);




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
    renderer.setSize(1320, 660);
    renderer.render(scene, camera);

    // Create a skybox
    const spaceTexture = new THREE.TextureLoader().load('space.jpg');
    const spaceBackground = new THREE.Mesh(
        new THREE.BoxGeometry(1000, 1000, 15000),
        new THREE.MeshBasicMaterial({ map: spaceTexture, side: THREE.BackSide })
    );
    scene.add(spaceBackground);

    // Generating stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff });
    const starsCount = 100000;

    const starsPositions = [];
    for (let i = 0; i < starsCount; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 15000;
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
    if(keyboard[65]){ // A key for left
        if(mesh.position.x > -75){
            mesh.position.x -= character.speed * 5;
        }
    }

    if(keyboard[68]){ //D Key for right 
        if(mesh.position.x < 75){
            mesh.position.x += character.speed * 5;
        }
        
    }

    if (keyboard[87] && !isJumping){ 
        isJumping = true;
        jump();
    }

    renderer.render(scene, camera);
}
function jump() {
    const initialY = mesh.position.y;
    const jumpSpeed = character.speed * 4;

    function animateJump() {
        // Jumping up phase
        if (mesh.position.y < initialY + jumpHeight && !isFalling) {
            mesh.position.y += jumpSpeed;
            mesh.position.z -= character.speed * 2;
            requestAnimationFrame(animateJump);
        } 
        // Falling down phase
        else if (mesh.position.y > initialY) {
            isFalling = true;
            mesh.position.y -= jumpSpeed;
            mesh.position.z -= character.speed * 2;
            requestAnimationFrame(animateJump);
        } 
        // Reset after completing the jump
        else {
            isJumping = false;
            isFalling = false;
            mesh.position.y = initialY; // Ensure accurate final position
        }
    }

    animateJump();
}

function updateScore(){
    score += 100;
    document.getElementById('scoreContainer').innerText = 'Score: ' + score;
}


function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScoreContainer').innerText = 'High Score: ' + highScore;
    }
}

// Set up keyboard event listeners
window.addEventListener("keydown", (event) => {
    keyboard[event.keyCode] = true;
});

window.addEventListener("keyup", (event) => {
    keyboard[event.keyCode] = false;
});

window.onload = init;




