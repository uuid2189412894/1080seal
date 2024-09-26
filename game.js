// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions to window dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Asset images
const seal = new Image();
seal.src = 'seal.png'; // Replace with your seal image URL or path

const treeImage = new Image();
treeImage.src = 'tree.png'; // Replace with your tree image URL or path

// Game variables
let sealX = 0; // Seal's horizontal position (-1 to 1)
let sealY = 0; // Seal's depth position (0 to maxDepth)

const sealSpeed = 0.08; // Increased speed for sensitivity
const maxDepth = 5; // Maximum depth the seal can move to

let obstacles = [];
const obstacleSpawnInterval = 1000; // Obstacles spawn every 1 second
let obstacleSpeed = 0.025; // Speed at which obstacles approach

// Movement flags
const keysPressed = {};

let score = 0;
let gameOver = false;

// Event listeners for controls
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Control functions
function keyDownHandler(e) {
    keysPressed[e.key.toLowerCase()] = true;
}

function keyUpHandler(e) {
    keysPressed[e.key.toLowerCase()] = false;
}

// Game initialization
function init() {
    obstacles = [];
    score = 0;
    gameOver = false;
    sealX = 0;
    sealY = 0;
    obstacleSpeed = 0.025; // Reset obstacle speed

    // Start spawning obstacles
    if (typeof obstacleSpawner !== 'undefined') {
        clearInterval(obstacleSpawner);
    }
    obstacleSpawner = setInterval(spawnObstacle, obstacleSpawnInterval);
}

// Spawn obstacles
function spawnObstacle() {
    const xPosition = (Math.random() * 2 - 1) * 1; // Random x between -1 and 1
    const yPosition = maxDepth + 2; // Start beyond max depth

    obstacles.push({
        x: xPosition,
        y: yPosition,
        width: 0.5, // Width in world units
        height: 0.5, // Height in world units
    });
}

// Update game objects
function update() {
    if (!gameOver) {
        // Move seal based on keys pressed
        if (keysPressed['w'] && sealY < maxDepth) {
            sealY += sealSpeed;
        }
        if (keysPressed['s'] && sealY > 0) {
            sealY -= sealSpeed;
        }
        if (keysPressed['a'] && sealX > -1) {
            sealX -= sealSpeed;
        }
        if (keysPressed['d'] && sealX < 1) {
            sealX += sealSpeed;
        }

        // Ensure the seal stays within bounds
        sealX = Math.max(-1, Math.min(1, sealX));
        sealY = Math.max(0, Math.min(maxDepth, sealY));

        // Update obstacles
        for (let i = 0; i < obstacles.length; i++) {
            obstacles[i].y -= obstacleSpeed;

            // Collision detection
            const dx = obstacles[i].x - sealX;
            const dy = obstacles[i].y - sealY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < (obstacles[i].width + 0.3) / 2) {
                // Collision detected
                gameOver = true;
                clearInterval(obstacleSpawner);
                setTimeout(() => {
                    init();
                }, 2000); // Restart after 2 seconds
            }
        }

        // Remove off-screen obstacles
        obstacles = obstacles.filter(obstacle => obstacle.y > -1);

        // Increase score
        score++;

        // Optional: Increase difficulty over time
        obstacleSpeed += 0.00001;
    }
}

// Draw functions
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        // Draw ground
        drawGround();

        // Draw obstacles
        obstacles.forEach(obstacle => {
            drawObstacle(obstacle);
        });

        // Draw seal
        drawSeal();

        // Draw score
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.fillText('Score: ' + score, 10, 30);
    } else {
        // Draw game over screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 30);

        ctx.font = '30px Arial';
        ctx.fillText('Your score: ' + score, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText('Restarting...', canvas.width / 2, canvas.height / 2 + 50);
    }
}

// Draw ground plane
function drawGround() {
    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    gradient.addColorStop(0, '#ffffff'); // Near color
    gradient.addColorStop(1, '#cccccc'); // Far color

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Isometric projection function
function project(x, y) {
    const angle = Math.PI / 6; // 30 degrees for isometric projection
    const scale = 200; // Adjust for screen size

    const isoX = (x - y) * Math.cos(angle) * scale + canvas.width / 2;
    const isoY = (x + y) * Math.sin(angle) * scale + canvas.height / 2;

    return { x: isoX, y: isoY };
}

// Draw the seal
function drawSeal() {
    const pos = project(sealX, sealY);

    const sealWidth = 80; // Fixed size for the seal
    const sealHeight = 100;

    if (seal.complete) {
        ctx.drawImage(
            seal,
            pos.x - sealWidth / 2,
            pos.y - sealHeight / 2,
            sealWidth,
            sealHeight
        );
    }
}

// Draw obstacles
function drawObstacle(obstacle) {
    const pos = project(obstacle.x, obstacle.y);

    const scaleValue = 1 / (obstacle.y + 1); // Scale based on depth
    const obstacleWidth = 80 * scaleValue;
    const obstacleHeight = 100 * scaleValue;

    if (treeImage.complete) {
        ctx.drawImage(
            treeImage,
            pos.x - obstacleWidth / 2,
            pos.y - obstacleHeight / 2,
            obstacleWidth,
            obstacleHeight
        );
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game after images load
function startGame() {
    init();
    gameLoop();
}

// Load images and start the game
let imagesLoaded = 0;
function checkAllImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 2) {
        startGame();
    }
}

seal.onload = checkAllImagesLoaded;
seal.onerror = function () {
    console.error('Failed to load seal image.');
};

treeImage.onload = checkAllImagesLoaded;
treeImage.onerror = function () {
    console.error('Failed to load tree image.');
};
