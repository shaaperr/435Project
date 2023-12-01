import * as THREE from "three";

var keyboard = {};
var mesh;
var meshBound;
var renderer;
var camera;
var scene;
var light;
var light2;
var originalSpeed = 0.6;
var character = {height: 1.8, speed:originalSpeed, turnSpeed:Math.PI*.02};
var floorMesh;
var floorLength = 25000;
var isJumping = false;
var jumpHeight = 60; 
var isFalling = false;
let score = 0;
let highScore = 0;
let obstacles = [];
let obstacleBoxes = [];
let gameStarted = false;
let acceleration  = 0.0001;
var sunMesh;
var scoreInterval;




function init() {
     // Display the start screen and button, nothing else should be shown
     document.getElementById('startScreen').style.display = 'inline-block';
     document.getElementById('startButton').style.display = 'inline-block';
     document.getElementById('scoreContainer').style.display = 'none';
     document.getElementById('highScoreContainer').style.display = 'none';
     document.getElementById('gameOverScreen').style.display = 'none';
     document.getElementById('gameOverText').style.display = 'none';
     document.getElementById('restartButton').style.display = 'none';

     // Set up button click event listener to start the game
     document.getElementById('startButton').addEventListener('click', startGame);
     document.getElementById('restartButton').addEventListener('click', tryAgain);
 
     function startGame() { //ADDED FOR START SCREEN
        if (!gameStarted) {
            // Hide the start screen and button
            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('startButton').style.display = 'none';

            // Show the score containers
            document.getElementById('scoreContainer').style.display = 'inline-block';
            document.getElementById('highScoreContainer').style.display = 'inline-block';
    
            // Show the canvas
            document.querySelector('.webgl').style.display = 'inline-block';
    
            // Remove the button click event listener
            document.getElementById('startButton').removeEventListener('click', startGame);
    
            // Set gameStarted to true
            gameStarted = true;
            if(gameStarted){
                // Start the game, making sure nothing is rendered until the button is clicked
                renderEverything();
                animate();
                // Set interval to update score every 600 milliseconds, moved to wait until game starts to begin. Interval can be changed
                scoreInterval = setInterval(updateScore, 600);
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
        //mesh.castShadow = true;
        //mesh.receiveShadow = false;
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
        //floor.receiveShadow = true;
        floor.rotation.x = 3 * Math.PI / 2; // Rotate the floor to be horizontal
        scene.add(floor);

        

        const leftLineMaterial = new THREE.LineBasicMaterial({color: 0x000000});
        const leftLinePoints = [];
        leftLinePoints.push(new THREE.Vector3(-(150 / 3) / 2, 6.0, -floorLength / 2));
        leftLinePoints.push(new THREE.Vector3(-(150 / 3) / 2, 6.0, floorLength / 2));
        const leftLineGeometry = new THREE.BufferGeometry().setFromPoints(leftLinePoints);
        const leftLine = new THREE.Line(leftLineGeometry, leftLineMaterial);
        //leftLine.receiveShadow = true;
        scene.add(leftLine);

        const rightLineMaterial = new THREE.LineBasicMaterial({color: 0x000000});
        const rightLinePoints = [];
        rightLinePoints.push(new THREE.Vector3((150 / 3) / 2, 6.0, -floorLength / 2));
        rightLinePoints.push(new THREE.Vector3((150 / 3) / 2, 6.0, floorLength / 2));
        const rightLineGeometry = new THREE.BufferGeometry().setFromPoints(rightLinePoints);
        const rightLine = new THREE.Line(rightLineGeometry, rightLineMaterial);
        //rightLine.receiveShadow = true;
        scene.add(rightLine);

        //light need to create sun object
        light = new THREE.DirectionalLight(0xffffff, 2);
        light.position.set(0, 5, 9); //x, y, z
        scene.add(light);

        //light2 = new THREE.DirectionalLight(0xffffff, 0.1);
        //light2.position.set(0, 14, 0); //x, y, z
        //scene.add(light2);

        //sun
        const sunGeo = new THREE.SphereGeometry(100, 64, 64);
        const sunMaterial = new THREE.MeshStandardMaterial({
            color: "#FFDB58"
        });
        sunMesh = new THREE.Mesh(sunGeo, sunMaterial);
        sunMesh.position.set(-100, 300, -2000);
        const sunLight = new THREE.DirectionalLight( 0xffcf2a, 4);
        sunLight.position.set(-100, 300, -2000);
        //sunLight.castShadow = true;
        scene.add(sunLight);
        scene.add(sunMesh);

        //Set up shadow properties for the light
        //sunLight.shadow.mapSize.width = window.innerWidth; // default
        //sunLight.shadow.mapSize.height = window.innerHeight; // default
        //sunLight.shadow.camera.near = 5; // default
        //sunLight.shadow.camera.far = 2500; // default

        //camera
        camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(0, 20, 90);
        //camera.lookAt(new THREE.Vector3(0, character.height, 0));
        scene.add(camera);

        //render
        const canvas = document.querySelector(".webgl");
        renderer = new THREE.WebGLRenderer({ canvas });
        //renderer.shadowMap.enabled = true;
        //renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(window.innerWidth, window.innerHeight); //modified for full screen
        renderer.render(scene, camera);

        //Automatic resize window
        window.addEventListener("resize", () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        })

        // Create a skybox
        const spaceTexture = new THREE.TextureLoader().load('space.jpg');
        const spaceBackground = new THREE.Mesh(
            new THREE.BoxGeometry(window.innerWidth, window.innerHeight, 100000),
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

    function tryAgain() {
        console.log("Hello");
        mesh.position.set(0, character.height + 14, 0);
        character.speed = originalSpeed;
        
        camera.position.set(0, 20, 90);
        cameraRotation = 0
        const radius = 90;
        camera.position.set(
            mesh.position.x + radius * Math.sin(cameraRotation),
            mesh.position.y + 50,
            mesh.position.z + radius * Math.cos(cameraRotation)
        );

        sunMesh.position.set(-100, 300, -2000);

        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('gameOverText').style.display = 'none';
        document.getElementById('restartButton').style.display = 'none';

        gameStarted = true;
        score = 0;
        scoreInterval = setInterval(updateScore, 600);
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
    if (!gameStarted) {
        return;
    }
    requestAnimationFrame(animate);

    // Automatic forward movement
    mesh.position.z -= (character.speed += acceleration);
    mesh.rotation.x -= (0.15 + acceleration); //rotation now increases as sphere accelerates

    // Print the current speed to the console
    // console.log("Speed:", mesh.rotation.x);

    // Update the camera's position to follow the object
    camera.position.set(mesh.position.x, mesh.position.y + 50, mesh.position.z + 90);

    //Update Sun position
    sunMesh.position.set(mesh.position.x - 100, mesh.position.y + 200, mesh.position.z - 1500);

    if (keyboard[86]) {  // V KEY to place camera back behind character
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
    const jumpSpeed = character.speed * 3; //matches char speed better at 3, not 4

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
    score += 10;
    document.getElementById('scoreContainer').innerText = 'Score: ' + score;
    if (score > highScore) { updateHighScore(); }
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
            document.getElementById('gameOverScreen').style.display = 'flex';
            document.getElementById('gameOverText').style.display = 'flex';
            gameStarted = false;
            clearInterval(scoreInterval);

            setTimeout(() => { document.getElementById('restartButton').style.display = 'flex'; }, 2000);
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




