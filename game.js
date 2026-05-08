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

// Player class
class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = SCREEN_WIDTH / 2 - this.width / 2;
        this.y = SCREEN_HEIGHT - this.height - 10;
        this.speed = 5;
    }

    update() {
        if (keys.left && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys.right && this.x + this.width < SCREEN_WIDTH) {
            this.x += this.speed;
        }
    }

    draw() {
        ctx.fillStyle = GREEN;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    shoot() {
        return new Bullet(this.x + this.width / 2 - 2.5, this.y);
    }
}

// Bullet class
class Bullet {
    constructor(x, y) {
        this.width = 5;
        this.height = 10;
        this.x = x;
        this.y = y;
        this.speed = -10;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = WHITE;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return this.y + this.height < 0;
    }
}

// Enemy class
class Enemy {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (SCREEN_WIDTH - this.width);
        this.y = -this.height;
        this.speed = Math.random() * 2 + 1;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = RED;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return this.y > SCREEN_HEIGHT;
    }
}

// Game variables
let player = new Player();
let bullets = [];
let enemies = [];
let score = 0;
let gameRunning = true;

// Keyboard input
let keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' && gameRunning) {
        e.preventDefault();
        bullets.push(player.shoot());
    }
    if (e.code === 'KeyR' && !gameRunning) {
        e.preventDefault();
        restart();
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    // Clear canvas
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Update player
    player.update();
    player.draw();

    // Update bullets
    bullets = bullets.filter(bullet => {
        bullet.update();
        bullet.draw();
        return !bullet.isOffScreen();
    });

    // Spawn enemies
    if (Math.random() < 0.02) {
        enemies.push(new Enemy());
    }

    // Update enemies
    enemies = enemies.filter(enemy => {
        enemy.update();
        enemy.draw();

        // Check if enemy hits player
        if (checkCollision(player, enemy)) {
            gameOver();
            return false;
        }

        // Check if enemy reaches bottom
        if (enemy.isOffScreen()) {
            gameOver();
            return false;
        }

        return true;
    });

    // Check bullet-enemy collisions
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (checkCollision(bullet, enemy)) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 10;
                scoreElement.textContent = `Score: ${score}`;
            }
        });
    });

    requestAnimationFrame(gameLoop);
}

// Game over
function gameOver() {
    gameRunning = false;
    gameOverElement.innerHTML = 'Game Over<br>Press R to Restart';
    gameOverElement.style.display = 'block';
}

// Restart game
function restart() {
    player = new Player();
    bullets = [];
    enemies = [];
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    gameOverElement.style.display = 'none';
    gameRunning = true;
    gameLoop();
}

// Start game
gameLoop();