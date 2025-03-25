
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 10, 15);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({antialias: true,alpha: true});


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);


const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 0.7;
controls.screenSpacePanning = true;
controls.minDistance = 5;
controls.maxDistance = 25;
controls.maxPolarAngle = Math.PI / 2.1; 




const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(10, 10);

const grassGeometry = new THREE.PlaneGeometry(40, 40);
const grassMaterial = new THREE.MeshLambertMaterial({ 
    map:grassTexture,
     
    side: THREE.DoubleSide 
});
const grass = new THREE.Mesh(grassGeometry, grassMaterial);
grass.rotation.x = -Math.PI / 2; //we rotated it by 90 degrees by default it is standing up
grass.receiveShadow = true;
scene.add(grass);


const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);




// vertical road
const roadGeometry = new THREE.PlaneGeometry(5, 40); 
const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x2c2c2c, side: THREE.DoubleSide});
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2; 
road.receiveShadow = true;
scene.add(road);


// Horizontal road
const roadGeometry2 = new THREE.PlaneGeometry(40, 5); 
const roadMaterial2 = new THREE.MeshStandardMaterial({ color: 0x2c2c2c, side: THREE.DoubleSide });
const road1 = new THREE.Mesh(roadGeometry2, roadMaterial2);
road1.rotation.x = -Math.PI / 2; 
road.receiveShadow = true;
scene.add(road1);

road.position.y += 0.01; 
road1.position.y += 0.01; 

// horizontal line
const lineGeometry = new THREE.PlaneGeometry(40, 0.3); 
const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
const line = new THREE.Mesh(lineGeometry, lineMaterial);
line.position.set(0, 0.02, 0); 
line.rotation.x = -Math.PI / 2; 
scene.add(line);

// vertical line
const lineGeometry1 = new THREE.PlaneGeometry(0.2, 40); 
const lineMaterial1 = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
const line1 = new THREE.Mesh(lineGeometry1, lineMaterial1);
line1.position.set(0, 0.02, 0); 
line1.rotation.x = -Math.PI / 2; 
scene.add(line1);


// Light adjust karne ka bidu
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft light everywhere
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0);
directionalLight.position.set(10, 20, 10); // Light from top
scene.add(directionalLight);

// Buildings



const buildingTextures = [
    textureLoader.load('https://threejs.org/examples/textures/brick_diffuse.jpg'),
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg')
];



function buildings(width,height,length,x,y,z,colors,textureIndex=0){
    const buildgeometry = new THREE.BoxGeometry(width,height,length);
    const buildmaterial = new THREE.MeshStandardMaterial({
        map: buildingTextures[textureIndex],
        color: colors,
        roughness: 0.7,
        metalness: 0.2
    });
    
    const building  = new THREE.Mesh(buildgeometry , buildmaterial);
    building.position.set(x,y,z);
    building.castShadow = true;
    building.receiveShadow = true
    scene.add(building);

    addWindows(x, y, z, width, height, length);
    return building;
}

console.log(buildings(5,10,5,-10,3,-10,0x8B4513));
console.log(buildings(2.5,7,2.5,7,0,7,0x556B2F));
console.log(buildings(5,10,5,10,3,-10,0x4682B4,1));
console.log(buildings(2.5,7,2.5,-8,0,7,0x708090,1));
// console.log(buildings(10, 20, 10, -18, 0, 15, 0xCC8866, 1))

// Windows

function addWindows(x, y, z, width, height, length) {
    const windowGeometry = new THREE.BoxGeometry(width / 10, height / 15, 0.01);
    
    const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x88CCFF });

    for (let i = y + height / 15; i < y + height/2; i += height / 8) { // Rows of windows
        for (let j = -width / 3; j <= width / 3; j += width / 5) { // Columns of windows
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(x + j, i, z + length / 2 + 0.05); // Attach on front
            scene.add(window);
        }
    }
}




const carSpeed = 0.06;
const cars = []; 

function createCar(color, x, z, direction) {
    const carGroup = new THREE.Group();
    const scale = 0.2;
    
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(2.2*scale, 0.8*scale, 4.5*scale);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({  color: color,
    roughness: 0.2,
    metalness: 0.8,
    clearcoat:1.0,
    clearcoatRoughness: 0.1 
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5*scale;
    body.castShadow = true;
    body.receiveShadow = true;
    carGroup.add(body);
    
    // Car top
    const topGeometry = new THREE.BoxGeometry(2*scale, 0.9*scale, 2.2*scale);
    const topMaterial = new THREE.MeshPhysicalMaterial({ color: color,
    roughness: 0.2,
    metalness: 0.8,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1

    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.set(0, 1.2*scale, -0.5*scale);  // Lowered the top slightly
    top.castShadow = true;
    carGroup.add(top);

    const windshieldGeometry = new THREE.PlaneGeometry(1.8*scale, 0.8*scale);
    const windowMaterial = new THREE.MeshPhysicalMaterial({ 
        color: 0x111133,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    
    // Front windshield
    const frontWindshield = new THREE.Mesh(windshieldGeometry, windowMaterial);
    frontWindshield.position.set(0, 1.2*scale, 0.6*scale);
    frontWindshield.rotation.x = Math.PI / 4;
    carGroup.add(frontWindshield);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4*scale, 0.4*scale, 0.35*scale, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, 
    roughness: 0.7,
    metalness: 0.5
    });
    
    const wheelPositions = [
        [1.1*scale, 0.4*scale, 1*scale],  // Front right
        [-1.1*scale, 0.4*scale, 1*scale], // Front left
        [1.1*scale, 0.4*scale, -1*scale], // Back right
        [-1.1*scale, 0.4*scale, -1*scale] // Back left
    ];
    
    wheelPositions.forEach((pos) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.rotation.z = Math.PI / 2; // Rotate to look like wheels
        carGroup.add(wheel);
    });
    
    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.2*scale, 8, 8);
    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFCC });
    
    const headlight1 = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight1.position.set(0.8*scale, 0.5*scale, 2*scale);
    carGroup.add(headlight1);
    
    const headlight2 = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight2.position.set(-0.8*scale, 0.5*scale, 2*scale);
    carGroup.add(headlight2);
    
    // Set position
    carGroup.position.set(x, 0, z);
    carGroup.direction = direction;
    
    // Rotate car based on direction
    if(direction === "up") {
        carGroup.rotation.y = Math.PI; // Rotate 180 degrees
    } else if(direction === "left") {
        carGroup.rotation.y = Math.PI / 2 * 3; // Rotate 270 degrees
    } else if(direction === "right") {
        carGroup.rotation.y = Math.PI / 2; // Rotate 90 degrees
    }
   
    
    scene.add(carGroup);
    cars.push(carGroup);

    return carGroup;
}

function checkCollision(vehicle, otherVehicle) {
    
    let dx = Math.abs(vehicle.position.x - otherVehicle.position.x);
    let dz = Math.abs(vehicle.position.z - otherVehicle.position.z);
    
    
    if (vehicle.direction === otherVehicle.direction) {
       
        if (vehicle.direction === "right" || vehicle.direction === "left") {
            return dx < 1.8 && dz < 0.6;
        } else {
            return dx < 0.6 && dz < 1.8; 
        }
    } else {
      
        return dx < 1 && dz < 1;
    }
}

function getRandomColor() {
    const colors = [0xFF0000, 0x0000FF, 0x00FF00, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFA500];
    return colors[Math.floor(Math.random() * colors.length)];
}
function moveCars() {
    cars.forEach((car) => {
        let canMove = true;
        let nearTrafficLight = false;

        if (Math.abs(car.position.x) < 5 && Math.abs(car.position.z) < 5) {
            let lightIndex;
            let lightIsRed = false;

            if (car.direction === "right" && car.position.x < 0) {
                lightIndex = 2;
                lightIsRed = trafficLights[lightIndex].redLight.material.color.getHex() === 0xff0000;

                // Stop just before the traffic light
                if (lightIsRed && car.position.x > -5 && car.position.x < -1.5) {
                    canMove = false;
                    nearTrafficLight = true;
                }
            } else if (car.direction === "left" && car.position.x > 0) {
                lightIndex = 3; // Right traffic light
                lightIsRed = trafficLights[lightIndex].redLight.material.color.getHex() === 0xff0000;

                if (lightIsRed && car.position.x < 5 && car.position.x > 1.5) {
                    canMove = false;
                    nearTrafficLight = true;
                }
            } else if (car.direction === "up" && car.position.z > 0) {
                lightIndex = 1; // Bottom traffic light
                lightIsRed = trafficLights[lightIndex].redLight.material.color.getHex() === 0xff0000;

                // Stop just before the traffic light
                if (lightIsRed && car.position.z < 5 && car.position.z > 1.5) {
                    canMove = false;
                    nearTrafficLight = true;
                }
            } else if (car.direction === "down" && car.position.z < 0) {
                lightIndex = 0; // Top traffic light
                lightIsRed = trafficLights[lightIndex].redLight.material.color.getHex() === 0xff0000;

                // Stop just before the traffic light
                if (lightIsRed && car.position.z > -10 && car.position.z < -1.5) {
                    canMove = false;
                    nearTrafficLight = true;
                }
            }
        }

        if (canMove && !nearTrafficLight) {
            let collision = false;
            let frontCar = null;
            const safeDistance = 1.5;

            cars.forEach((otherCar) => {
                if (car !== otherCar) {
                    let dx = otherCar.position.x - car.position.x;
                    let dz = otherCar.position.z - car.position.z;
                    let distance = Math.sqrt(dx * dx + dz * dz);

                    if (car.direction === otherCar.direction && distance < safeDistance) {
                        if ((car.direction === "right" && dx > 0 && Math.abs(dz) < 0.5) ||
                            (car.direction === "left" && dx < 0 && Math.abs(dz) < 0.5) ||
                            (car.direction === "up" && dz < 0 && Math.abs(dx) < 0.5) ||
                            (car.direction === "down" && dz > 0 && Math.abs(dx) < 0.5)) {
                            collision = true;
                            frontCar = otherCar;
                        }
                    }
                }
            });

            if (collision && frontCar) {
                if (frontCar.lastPosition) {
                    const frontCarMoved =
                        Math.abs(frontCar.position.x - frontCar.lastPosition.x) > 0.01 ||
                        Math.abs(frontCar.position.z - frontCar.lastPosition.z) > 0.01;

                    if (frontCarMoved) {
                        canMove = true;
                    } else {
                        canMove = false;
                    }
                } else {
                    canMove = false;
                }
            }
        }

        if (!car.lastPosition) {
            car.lastPosition = { x: car.position.x, z: car.position.z };
        } else {
            car.lastPosition.x = car.position.x;
            car.lastPosition.z = car.position.z;
        }

        if (canMove) {
            switch (car.direction) {
                case "right":
                    car.position.x += carSpeed;
                    if (car.position.x > 20) car.position.x = -20;
                    break;
                case "left":
                    car.position.x -= carSpeed;
                    if (car.position.x < -20) car.position.x = 20;
                    break;
                case "up":
                    car.position.z -= carSpeed;
                    if (car.position.z < -20) car.position.z = 20;
                    break;
                case "down":
                    car.position.z += carSpeed;
                    if (car.position.z > 20) car.position.z = -20;
                    break;
            }
        }
    });
}

function spawnTraffic(initialCount = 0, addRandomInterval = true) {
    const lanes = {
        right: [-1.8, -2.4],
        left: [1.8, 2.4],
        up: [-1.8, -2.4],
        down: [1.8, 2.4]
    };

    cars.length = 0; // Clear existing cars

    // Spawn cars at the edges of the road
    for (let i = 0; i < initialCount; i++) {
        const directions = Object.keys(lanes);
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const lane = lanes[direction][Math.floor(Math.random() * lanes[direction].length)];

        let x, z;

        // Spawn cars at the edges of the road
        switch (direction) {
            case "right":
                x = -22; // Start at the left edge
                z = lane;
                break;
            case "left":
                x = 15; // Start at the right edge
                z = lane;
                break;
            case "up":
                x = lane;
                z = 20; // Start at the bottom edge
                break;
            case "down":
                x = lane;
                z = -20; // Start at the top edge
                break;
        }

        // Check if the spawn position is clear
        let canSpawn = true;
        cars.forEach(car => {
            if ((direction === "right" || direction === "left") &&
                Math.abs(car.position.z - z) < 1 &&
                Math.abs(car.position.x - x) < 3) {
                canSpawn = false;
            } else if ((direction === "up" || direction === "down") &&
                Math.abs(car.position.x - x) < 1 &&
                Math.abs(car.position.z - z) < 3) {
                canSpawn = false;
            }
        });

        if (canSpawn) {
            createCar(getRandomColor(), x, z, direction);
        }
    }

    if (addRandomInterval) {
        if (window.carSpawnInterval) {
            clearInterval(window.carSpawnInterval);
        }

        window.carSpawnInterval = setInterval(() => {
            if (cars.length < 70) {
                const direction = Object.keys(lanes)[Math.floor(Math.random() * 4)];
                const lane = lanes[direction][Math.floor(Math.random() * lanes[direction].length)];

                let x, z;

                // Spawn cars at the edges of the road
                switch (direction) {
                    case "right":
                        x = -20;
                        z = lane;
                        break;
                    case "left":
                        x = 20;
                        z = lane;
                        break;
                    case "up":
                        x = lane;
                        z = 20;
                        break;
                    case "down":
                        x = lane;
                        z = -20;
                        break;
                }

                // Check if the spawn position is clear
                let canSpawn = true;
                cars.forEach(car => {
                    if ((direction === "right" || direction === "left") &&
                        Math.abs(car.position.z - z) < 1 &&
                        Math.abs(car.position.x - x) < 3) {
                        canSpawn = false;
                    } else if ((direction === "up" || direction === "down") &&
                        Math.abs(car.position.x - x) < 1 &&
                        Math.abs(car.position.z - z) < 3) {
                        canSpawn = false;
                    }
                });

                if (canSpawn) {
                    createCar(getRandomColor(), x, z, direction);
                }
            }
        }, 1000 + Math.random() * 2000); // Random interval between 1-3 seconds
    }
}

// Start with 0 cars initially and spawn them over time
spawnTraffic(20, true);





// Traffic Lights

function lights(x, z, a, b, c) {
    const trafficLight = new THREE.Group();

    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 16);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(0, 1.5, 0);
    trafficLight.add(pole);
    
    const boxGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.4);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const lightBox = new THREE.Mesh(boxGeometry, boxMaterial);
    lightBox.position.set(0, 2.8, 0);
    trafficLight.add(lightBox);
    
    const lightGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  
    const redMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000
    });
    
    const yellowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffff00
    });
    
    const greenMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x00ff00
    });
    
    const redLight = new THREE.Mesh(lightGeometry, redMaterial);
    const yellowLight = new THREE.Mesh(lightGeometry, yellowMaterial);
    const greenLight = new THREE.Mesh(lightGeometry, greenMaterial);

    redLight.position.set(a, b, c);
    yellowLight.position.set(a, b-0.2, c);
    greenLight.position.set(a, b-0.4, c);

    trafficLight.add(redLight, yellowLight, greenLight);

    trafficLight.position.set(x, 0, z);
    scene.add(trafficLight);

    return { trafficLight, redLight, yellowLight, greenLight };
}

const trafficLights = [
    lights(0, -4, 0, 3, -0.2),   
    lights(0, 4, 0, 3, 0.2),    
    lights(-4, 0, -0.2, 3, 0),
    lights(4, 0, 0.2, 3, 0)     
];

// Define the setTrafficLightCycle function
function setTrafficLightCycle(trafficLights, cycleTime1, cycleTime2) {
    // 0 = NS Green, EW Red (using cycleTime1)
    // 1 = NS Red, EW Green (using cycleTime2)
    let state = 0;

    // Convert milliseconds to seconds for display
    let cycleTime1Seconds = Math.floor(cycleTime1 / 1000);
    let cycleTime2Seconds = Math.floor(cycleTime2 / 1000);

    // Create timer displays for all four positions
    const northTimer = createPositionedTimer(scene, cycleTime1Seconds, 0.7, 3.5, -4.2);
    const southTimer = createPositionedTimer(scene, cycleTime1Seconds, 0, 3.5, 4.2);
    const eastTimer = createPositionedTimer(scene, cycleTime1Seconds, 4.5, 3.4, 0.2);
    const westTimer = createPositionedTimer(scene, cycleTime1Seconds, -3.8, 3.4, -0.3);

    // Current timer value
    let currentTimerValue = cycleTime1Seconds;

    // Set up timers to update every second
    const timerInterval = setInterval(() => {
        // Decrement the timer for all displays
        currentTimerValue--;
        
        // Update all timer displays with the same value
        northTimer.setValue(currentTimerValue);
        southTimer.setValue(currentTimerValue);
        eastTimer.setValue(currentTimerValue);
        westTimer.setValue(currentTimerValue);
    }, 1000);

    function updateLights() {
        if (state === 0) {
            // 🟢 North-South Green | 🔴 East-West Red
            trafficLights[0].redLight.material.color.set(0x222222);
            trafficLights[0].yellowLight.material.color.set(0x222222);
            trafficLights[0].greenLight.material.color.set(0x00ff00);

            trafficLights[1].redLight.material.color.set(0x222222);
            trafficLights[1].yellowLight.material.color.set(0x222222);
            trafficLights[1].greenLight.material.color.set(0x00ff00);

            trafficLights[2].greenLight.material.color.set(0x222222);
            trafficLights[2].yellowLight.material.color.set(0x222222);
            trafficLights[2].redLight.material.color.set(0xff0000);

            trafficLights[3].greenLight.material.color.set(0x222222);
            trafficLights[3].yellowLight.material.color.set(0x222222);
            trafficLights[3].redLight.material.color.set(0xff0000);

            // Reset timer value to cycleTime1
            currentTimerValue = cycleTime1Seconds;
            
            // Update all timer displays with the same value
            northTimer.setValue(currentTimerValue);
            southTimer.setValue(currentTimerValue);
            eastTimer.setValue(currentTimerValue);
            westTimer.setValue(currentTimerValue);

            setTimeout(() => {
                state = 1; // Change to NS Red, EW Green
                updateLights();
            }, cycleTime1);
        } else if (state === 1) {
            // 🔴 North-South Red | 🟢 East-West Green
            trafficLights[0].greenLight.material.color.set(0x222222);
            trafficLights[0].yellowLight.material.color.set(0x222222);
            trafficLights[0].redLight.material.color.set(0xff0000);

            trafficLights[1].greenLight.material.color.set(0x222222);
            trafficLights[1].yellowLight.material.color.set(0x222222);
            trafficLights[1].redLight.material.color.set(0xff0000);

            trafficLights[2].redLight.material.color.set(0x222222);
            trafficLights[2].yellowLight.material.color.set(0x222222);
            trafficLights[2].greenLight.material.color.set(0x00ff00);

            trafficLights[3].redLight.material.color.set(0x222222);
            trafficLights[3].yellowLight.material.color.set(0x222222);
            trafficLights[3].greenLight.material.color.set(0x00ff00);

            // Reset timer value to cycleTime2
            currentTimerValue = cycleTime2Seconds;
            
            // Update all timer displays with the same value
            northTimer.setValue(currentTimerValue);
            southTimer.setValue(currentTimerValue);
            eastTimer.setValue(currentTimerValue);
            westTimer.setValue(currentTimerValue);

            setTimeout(() => {
                state = 0; // Back to NS Green, EW Red
                updateLights();
            }, cycleTime2);
        }
    }

    // Start the cycle
    updateLights();

    // Return cleanup function
    return function cleanup() {
        clearInterval(timerInterval);
    };
}

async function loadTrafficLightData() {
    try {
        const response = await fetch('data.txt');
        if (!response.ok) throw new Error("File not found");

        const text = await response.text();
        const values = text.trim().split(/\s+/).map(Number);

        if (values.length >= 2) {
            console.log(`Loaded values: ${values[0]}ms, ${values[1]}ms`);
            
            // Keep track of the current cleanup function
            let currentCleanup = null;
            
            // Get first two values from data.txt
            const cycleTime1 = values[0]*1000;
            const cycleTime2 = values[1]*1000;
            
            // Start the traffic light cycle with the loaded times
            currentCleanup = setTrafficLightCycle(trafficLights, cycleTime1, cycleTime2);
            
        } else {
            console.error("Invalid file format. Expected at least 2 numbers.");
            // Fallback to default values if file format is invalid
            setTrafficLightCycle(trafficLights, 10000, 10000); // 10 seconds each
        }
    } catch (error) {
        console.error("Error loading traffic light data:", error);
        // Fallback to default values if file loading fails
        setTrafficLightCycle(trafficLights, 10000, 10000); // 10 seconds each
    }
}
// Call the function to load traffic light data
loadTrafficLightData();

function createPositionedTimer(scene, initialValue, x, y, z) {
    let timerMesh = null;
    let font = null;

    const fontLoader = new THREE.FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (loadedFont) {
        font = loadedFont;
        updateDisplay(initialValue);
    });

    function updateDisplay(value) {
        if (!font) return; 
      
        if (timerMesh && timerMesh.parent) {
            scene.remove(timerMesh);
        }

        const textGeometry = new THREE.TextGeometry(value.toString(), {
            font: font,
            size: 0.5,
            height: 0.1,
        });
 
        textGeometry.computeBoundingBox();
        const centerOffset = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);

        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        timerMesh = new THREE.Mesh(textGeometry, textMaterial);
  
        timerMesh.position.set(x + centerOffset, y, z);
   
        if (x === -3.8) {
            timerMesh.rotation.y = -Math.PI / 2; 
        }

        if (x === 4.5) {
            timerMesh.rotation.y = Math.PI / 2; 
        }

        if (z === -4.2) {
            timerMesh.rotation.y = Math.PI; 
        }
      
        scene.add(timerMesh);
    }

    return {
        setValue: updateDisplay,
    };
}




const timegeometry = new THREE.BoxGeometry(2,1,0);
const timematerial = new THREE.MeshBasicMaterial({color: "black"});

function timer1(x,y,z,l,b){

    const timegeometry = new THREE.BoxGeometry(l,1,b);
    const timematerial = new THREE.MeshBasicMaterial({color: "black"});
    const timer = new THREE.Mesh(timegeometry,timematerial);

    timer.position.set(x,y,z);

    scene.add(timer);
}

timer1(0,3.6,-4,2,0);
timer1(0,3.6,4,2,0);
timer1(4,3.6,0,0,2);
timer1(-4,3.6,0,0,2);



  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    moveCars();
    
    renderer.render(scene, camera);
    
}
animate();
