// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions to window dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Seal character
const seal = new Image();
seal.src = 'seal.png'; // Replace with your seal image URL

// Tree obstacle
const tree = new Image();
tree.src = 'tree.png'; // Replace with your tree image URL

// Game variables
let sealX, sealY, sealWidth, sealHeight, sealSpeed;
let trees;
let treeWidth, treeHeight, treeSpeed, spawnInterval;
let score;
let leftPressed, rightPressed;
let touchX;
let gameOver;
let gameLoopId;

// Initialize game variables
function init() {
    // Seal properties
    sealX = canvas.width / 2;
    sealY = canvas.height - 100;
    sealWidth = 50;
    sealHeight = 50;
    sealSpeed = 7;

    // Tree obstacles
    trees = [];
    treeWidth = 50;
    treeHeight = 70;
    treeSpeed = 5;
    spawnInterval = 2000; // Trees spawn every 2 seconds

    // Score
    score = 0;

    // Controls
    leftPressed = false;
    rightPressed = false;
    touchX = null;

    // Game state
    gameOver = false;

    // Start spawning trees
    if (typeof treeSpawner !== 'undefined') {
        clearInterval(treeSpawner);
    }
    treeSpawner = setInterval(spawnTree, spawnInterval);
}

// Event listeners for keyboard controls
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// Event listeners for touch controls
canvas.addEventListener('touchstart', touchStartHandler);
canvas.addEventListener('touchmove', touchMoveHandler);
canvas.addEventListener('touchend', touchEndHandler);

function keyDownHandler(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        leftPressed = true;
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        rightPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        leftPressed = false;
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        rightPressed = false;
    }
}

function touchStartHandler(e) {
    touchX = e.touches[0].clientX;
}

function touchMoveHandler(e) {
    const deltaX = e.touches[0].clientX - touchX;
    if (deltaX < 0) {
        leftPressed = true;
        rightPressed = false;
    } else {
        leftPressed = false;
        rightPressed = true;
    }
    touchX = e.touches[0].clientX;
}

function touchEndHandler(e) {
    leftPressed = false;
    rightPressed = false;
    touchX = null;
}

function spawnTree() {
    const xPosition = Math.random() * (canvas.width - treeWidth);
    trees.push({ x: xPosition, y: -treeHeight });
}

// Update game objects
function update() {
    if (!gameOver) {
        // Move seal
        if (leftPressed && sealX > 0) {
            sealX -= sealSpeed;
        }
        if (rightPressed && sealX < canvas.width - sealWidth) {
            sealX += sealSpeed;
        }

        // Move trees
        for (let i = 0; i < trees.length; i++) {
            trees[i].y += treeSpeed;

            // Collision detection
            if (
                sealX < trees[i].x + treeWidth &&
                sealX + sealWidth > trees[i].x &&
                sealY < trees[i].y + treeHeight &&
                sealY + sealHeight > trees[i].y
            ) {
                // Trigger game over
                gameOver = true;
                // Stop tree spawning
                clearInterval(treeSpawner);
                // Show game over message and restart
                setTimeout(() => {
                    init();
                }, 2000); // Wait 2 seconds before restarting
            }
        }

        // Remove off-screen trees
        trees = trees.filter(tree => tree.y < canvas.height);

        // Increase score
        score++;
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        // Draw seal
        ctx.drawImage(seal, sealX, sealY, sealWidth, sealHeight);

        // Draw trees
        for (let i = 0; i < trees.length; i++) {
            ctx.drawImage(tree, trees[i].x, trees[i].y, treeWidth, treeHeight);
        }

        // Draw score
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.fillText(' Score: ' + score, 10, 30);
    } else {
        // Draw game over message
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

// Game loop
function gameLoop() {
    update();
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Start the game after images load
seal.onload = () => {
    tree.onload = () => {
        init();
        gameLoop();
    };
};

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
