import * as THREE from "three";

var keyboard = {};
var mesh;
var meshBound;
var renderer;
var camera;
var scene;
var light;
var light2;
var character = {height: 1.8, speed:0.4, turnSpeed:Math.PI*.02};
var floorMesh;
var floorLength = 15000;
var isJumping = false;
var jumpHeight = 60; 
var isFalling = false;
let score = 0;
let highScore = 0;
let obstacleBoxes = [];
let gameStarted = false;
let acceleration  = 0.0001;




function init() {
     // Display the start screen and button, nothing else should be shown
     document.getElementById('startScreen').style.display = 'block';
     document.getElementById('startButton').style.display = 'block';
     document.getElementById('scoreContainer').style.display = 'none';
     document.getElementById('highScoreContainer').style.display = 'none';
 
     // Set up button click event listener to start the game
     document.getElementById('startButton').addEventListener('click', startGame);
 
     function startGame() { //ADDED FOR START SCREEN
        if (!gameStarted) {
            // Hide the start screen and button
            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('startButton').style.display = 'none';
    
            // Show the score containers
            document.getElementById('scoreContainer').style.display = 'block';
            document.getElementById('highScoreContainer').style.display = 'block';
    
            // Show the canvas
            document.querySelector('.webgl').style.display = 'block';
    
            // Remove the button click event listener
            document.getElementById('startButton').removeEventListener('click', startGame);
    
            // Set gameStarted to true
            gameStarted = true;
            if(gameStarted){
                // Start the game, making sure nothing is rendered until the button is clicked
                renderEverything();
                animate();
                // Set interval to update score every 2000 milliseconds (2 seconds), moved to wait until game starts to begin. Interval can be changed
                setInterval(updateScore, 2000);
            }
            
        }
     }

    function renderEverything(){ 
        scene = new THREE.Scene();

        const baseColorTexture = new THREE.TextureLoader().load("./metallic/Metal_006_basecolor.jpg");
        const normalMapTexture = new THREE.TextureLoader().load("./futuristic/futuristic-cube-metal_normal-dx.png");
        const roughnessMapTexture = new THREE.TextureLoader().load("./futuristic/futuristic-cube-metal_roughness.png");
        const metallicMapTexture = new THREE.TextureLoader().load("./futuristic/futuristic-cube-metal_metallic.png");
        const heightMapTexture = new THREE.TextureLoader().load("./futuristic/futuristic-cube-metal_height.png");
        const ambientMapTexture = new THREE.TextureLoader().load("./futuristic/futuristic-cube-metal_ao.png");
        const albedoMapTexture = new THREE.TextureLoader().load("./futuristic/futuristic-cube-metal_albedo.png");
        const geometry = new THREE.SphereGeometry(14, 20, 20);

            //environmentMap
            const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
                format: THREE.RBGFormat,
                generateMipmaps: true,
                minFilter: THREE.LinearMipMapLinearFilter,
                //encoding: THREE.sRGBEncoding

            })

        const material = new THREE.MeshStandardMaterial({
            color: "#FFFFFF",
            map: albedoMapTexture,  // Set albedo texture as the color map
            normalMap: normalMapTexture,
            roughnessMap: roughnessMapTexture,
            metalnessMap: metallicMapTexture,
            aoMap: ambientMapTexture,
            displacementMap: heightMapTexture,
            displacementScale: 1.2,
            envMap: cubeRenderTarget.texture,
            // wireframe:true
            metalness: 1.0
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = character.height + 14;
        mesh.geometry.attributes.uv2 = mesh.geometry.attributes.uv
        scene.add(mesh);
        meshBound = new THREE.Sphere(mesh.position, 15);



        //ground needs texture, reused the repeat code
        const floornormalMapTexture = new THREE.TextureLoader().load("./limestone/carvedlimestoneground1_Normal-ogl.png");
        floornormalMapTexture.wrapS = THREE.RepeatWrapping;
        floornormalMapTexture.wrapT = THREE.RepeatWrapping;
        
        const floorroughnessMapTexture = new THREE.TextureLoader().load("./limestone/carvedlimestoneground1_Roughness.png");
        floorroughnessMapTexture.wrapS = THREE.RepeatWrapping;
        floorroughnessMapTexture.wrapT = THREE.RepeatWrapping;
        
        const floormetallicMapTexture = new THREE.TextureLoader().load("./limestone/carvedlimestoneground1_Normal-ogl.png");
        floormetallicMapTexture.wrapS = THREE.RepeatWrapping;
        floormetallicMapTexture.wrapT = THREE.RepeatWrapping;
        
        const floorheightMapTexture = new THREE.TextureLoader().load("./limestone/carvedlimestoneground1_Height.png");
        floorheightMapTexture.wrapS = THREE.RepeatWrapping;
        floorheightMapTexture.wrapT = THREE.RepeatWrapping;
        
        const floorambientMapTexture = new THREE.TextureLoader().load("./limestone/carvedlimestoneground1_Ambient_Occlusion.png");
        floorambientMapTexture.wrapS = THREE.RepeatWrapping;
        floorambientMapTexture.wrapT = THREE.RepeatWrapping;
        
        const flooralbedoMapTexture = new THREE.TextureLoader().load("./limestone/carvedlimestoneground1_Base_Color.png");
        flooralbedoMapTexture.wrapS = THREE.RepeatWrapping;
        flooralbedoMapTexture.wrapT = THREE.RepeatWrapping;
 
        const floorGeometry = new THREE.PlaneGeometry(150, floorLength, 512, 512); // Adjust the size as needed
        // Adjust the repeat values as needed
        floornormalMapTexture.repeat.set(2, 400);
        floorroughnessMapTexture.repeat.set(2, 400);
        floormetallicMapTexture.repeat.set(2, 400);
        floorheightMapTexture.repeat.set(2, 400);
        floorambientMapTexture.repeat.set(2, 400);
        flooralbedoMapTexture.repeat.set(2, 400);

       
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: "#8D6E63",
            //wireframe: true, // doesn't show texture if true
            map: flooralbedoMapTexture,
            normalMap: floornormalMapTexture,
            roughnessMap: floorroughnessMapTexture,
           // metalnessMap: floormetallicMapTexture,
            aoMap: floorambientMapTexture,
            displacementMap: floorheightMapTexture,
            displacementScale: 6.5,
           // metalness: 7.0

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
        light = new THREE.DirectionalLight(0xffffff, 2.0);
        light.position.set(0, 5, 9); //x, y, z
        scene.add(light);

        light2 = new THREE.DirectionalLight(0xffffff, .1);
        light2.position.set(0, 14, 0); //x, y, z
        scene.add(light2);



        //camera
        camera = new THREE.PerspectiveCamera(90, 1280 / 720, 0.1, 1000);
        camera.position.set(0, 20, 90);
        camera.lookAt(new THREE.Vector3(0, character.height, 0));
        scene.add(camera);

        //render
        const canvas = document.querySelector(".webgl");
        renderer = new THREE.WebGLRenderer({ canvas });
        renderer.setSize(window.innerWidth, window.innerHeight); //modified for full screen
        renderer.render(scene, camera);

        // Create a skybox
        const spaceTexture = new THREE.TextureLoader().load('space.jpg');
        const spaceBackground = new THREE.Mesh(
            new THREE.BoxGeometry(1000, 1000, 100000),
            new THREE.MeshBasicMaterial({ map: spaceTexture, side: THREE.BackSide })
        );
        scene.add(spaceBackground);

        // Generating stars
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff });
        const starsCount = 500000;

        const starsPositions = [];
        for (let i = 0; i < starsCount; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 100000;
            starsPositions.push(x, y, z);
        }

        // Generating obstacles
        for (let i = 0; i < 75; i++) {
            let x = Math.floor(Math.random() * 3);
            if (x == 0) {
                x = -50;
            }
            else if (x == 1) {
                x = 0;
            }
            else {
                x = 50;
            }
            const obstacleSections = 100
            const section = -Math.floor(Math.random() * (obstacleSections - 2) + 2);
            const z = section * (floorLength / 2) / obstacleSections;
            createObstacle(x, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Set up keyboard event listeners
        window.addEventListener("keydown", (event) => {
            keyboard[event] = true;
        });

        window.addEventListener("keyup", (event) => {
            keyboard[event] = false;
        });

        animate();
    }
}
    
//For smooth lane change transitions and camera movement with v
function lerp(start, end, alpha) {
    return start * (1 - alpha) + end * alpha;
}

let cameraRotation = 0;

// Function to animate the scene
function animate() {
    requestAnimationFrame(animate);

    // Automatic forward movement
    mesh.position.z -= (character.speed += acceleration);
    mesh.rotation.x -= 0.15;

    // Print the current speed to the console
    // console.log("Speed:", character.speed);

    // Update the camera's position to follow the object
    camera.position.set(mesh.position.x, mesh.position.y + 50, mesh.position.z + 90);

    if (keyboard[86]) {  // V KEY to change to sideview, have to hold
        const targetRotation = 0; 
        cameraRotation = lerp(cameraRotation, targetRotation, 0.3);
    }

      // Adjust the camera rotation based on keyboard input
      if (keyboard[37]) { // left key
        cameraRotation += character.turnSpeed;
    }
    
    if (keyboard[39]) { // right key
        cameraRotation -= character.turnSpeed;
    }
    
    // Update the camera's position to follow the object and rotate around the sphere
    const radius = 90;
    camera.position.set(
        mesh.position.x + radius * Math.sin(cameraRotation),
        mesh.position.y + 50,
        mesh.position.z + radius * Math.cos(cameraRotation)
    );
    camera.lookAt(mesh.position);
    

    if (keyboard[65]) { // A key for left
        if (mesh.position.x > -75) {
            const targetX = -50;
            mesh.position.x = lerp(mesh.position.x, targetX, 0.35); // Adjust the alpha value as needed, center of lane right now
        }
    }

    if (keyboard[83]) { // S key for middle
        if (mesh.position.x > -75) {
            const targetX = 0;
            mesh.position.x = lerp(mesh.position.x, targetX, 0.35); // Adjust the alpha value as needed, center of lane right now
        }
    }


    if (keyboard[68]) { // D Key for right 
        if (mesh.position.x < 75) {
            const targetX = 50;
            mesh.position.x = lerp(mesh.position.x, targetX, 0.35); // Adjust the alpha value as needed, center of lane right now
        }
    }

    if (keyboard[87] && !isJumping){ 
        isJumping = true;
        jump();
    }
      // meshBound.copy(mesh.geometry.boundingSphere).applyMatrix4(mesh.matrixWorld);

    checkCollisions();
    renderer.render(scene, camera);
}

function createObstacle(x, z) {
    const obstacleHeight = 20; // Change obstacle height here
    const obstacleGeometry = new THREE.BoxGeometry(20, obstacleHeight, 20);
    const obstacleMesh = new THREE.MeshBasicMaterial( {color: 0x777777});
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMesh);
    obstacle.position.set(x, obstacleHeight / 2 + 3, z);

    const obstacleBox = new  THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    obstacleBox.setFromObject(obstacle);

    obstacleBoxes.push(obstacleBox);
    scene.add(obstacle);
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

function checkCollisions() {
    for (var obstacle of obstacleBoxes) {
        if (meshBound.intersectsBox(obstacle)) {
            console.log("Intersects!");
        }
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




