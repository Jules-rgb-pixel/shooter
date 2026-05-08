const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;

// Colors
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const RED = '#FF0000';
const GREEN = '#00FF00';

// Player
let player = {
    x: SCREEN_WIDTH / 2 - 25,
    y: SCREEN_HEIGHT - 60,
    width: 50,
    height: 50,
    speed: 5
};

// Bullets
let bullets = [];

// Enemies
let enemies = [];

let score = 0;
let gameRunning = true;
let keys = {};

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
        e.preventDefault();
        shoot();
    }
    if (e.code === 'KeyR' && !gameRunning) {
        restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Functions
function shoot() {
    if (!gameRunning) return;
    bullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10,
        speed: -10
    });
}

function update() {
    if (!gameRunning) return;

    // Update player
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x + player.width < SCREEN_WIDTH) {
        player.x += player.speed;
    }

    // Update bullets
    bullets = bullets.filter(bullet => {
        bullet.y += bullet.speed;
        return bullet.y > -bullet.height;
    });

    // Update enemies
    enemies = enemies.filter(enemy => {
        enemy.y += enemy.speed;
        return enemy.y < SCREEN_HEIGHT + enemy.height;
    });

    // Spawn enemies
    if (Math.random() < 0.02) {
        enemies.push({
            x: Math.random() * (SCREEN_WIDTH - 40),
            y: -40,
            width: 40,
            height: 40,
            speed: Math.random() * 2 + 1
        });
    }

    // Check collisions
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                bullets.splice(bIndex, 1);
                enemies.splice(eIndex, 1);
                score += 10;
            }
        });
    });

    // Check game over
    enemies.forEach(enemy => {
        if (enemy.y + enemy.height >= SCREEN_HEIGHT ||
            (enemy.x < player.x + player.width &&
             enemy.x + enemy.width > player.x &&
             enemy.y < player.y + player.height &&
             enemy.y + enemy.height > player.y)) {
            gameRunning = false;
            gameOverElement.style.display = 'block';
        }
    });
}

function draw() {
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Draw player
    ctx.fillStyle = GREEN;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw bullets
    ctx.fillStyle = WHITE;
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemies
    ctx.fillStyle = RED;
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Update score
    scoreElement.textContent = `Score: ${score}`;
}

function restartGame() {
    player.x = SCREEN_WIDTH / 2 - 25;
    player.y = SCREEN_HEIGHT - 60;
    bullets = [];
    enemies = [];
    score = 0;
    gameRunning = true;
    gameOverElement.style.display = 'none';
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();