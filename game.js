const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Add after canvas initialization
const wallTexture = new Image();
wallTexture.src = 'textures/wall.png';

// Remove the enemyCanvas and enemyCtx setup, just keep regular enemy texture loading
const enemyTexture = new Image();
enemyTexture.src = 'textures/enemy.png';

// Add new textures after other texture declarations
const keyTexture = new Image();
keyTexture.src = 'textures/key.png';
const doorTexture = new Image();
doorTexture.src = 'textures/door.png';

// Add after other texture declarations
const winTexture = new Image();
winTexture.src = 'textures/win.png';

// Add after canvas initialization
const RESOLUTION_SCALE = 0.5;  // Half resolution
const renderCanvas = document.createElement('canvas');
const renderCtx = renderCanvas.getContext('2d');

// Add after other constants
const gameState = {
    isGameOver: false,
    restartPressed: false,
    hasKey: false,
    hasWon: false,
    isStartMenu: true  // Add this new state
};

// Add new constants near the top
const FOV = Math.PI / 4;  // Narrower FOV for square display
const SCREEN_DISTANCE = 1.0;

// Add these constants near the top
const TEXTURE_SIZE = 64;  // Standard size for textures
const PLANE_X = 0;
const PLANE_Y = 0.5;      // Adjust camera plane for square aspect ratio

// Replace shading constants with single fog constant
const FOG_DISTANCE = 8.0;  // How far until maximum darkness

// Add these constants near the top with other constants
const WALL_HEIGHT = 1.0;  // Standard wall height
const DISTANCE_TO_PROJ = 1.0;  // Distance to projection plane

// Add near other constants
const MIN_WALL_DIST = 0.5;     // Minimum distance to wall
const MAX_WALL_HEIGHT = 2.0;   // Maximum wall height multiplier

// Add near other constants at the top
const TWO_PI = Math.PI * 2;

// Add these constants near the top with others
const MAX_TURN_SPEED = 0.15;        // Maximum rotation speed
const SPRINT_TURN_PENALTY = 0.5;    // Reduce turn speed while sprinting

// Add near the top with other constants
const bgMusic = new Audio('music/music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5; // 50% volume

// Wait for both textures
Promise.all([
    new Promise(resolve => wallTexture.onload = resolve),
    new Promise(resolve => enemyTexture.onload = resolve),
    new Promise(resolve => keyTexture.onload = resolve),
    new Promise(resolve => doorTexture.onload = resolve),
    new Promise(resolve => winTexture.onload = resolve),
    new Promise(resolve => {
        bgMusic.addEventListener('canplaythrough', resolve);
        bgMusic.load();
    })
]).then(() => {
    gameLoop();  // Just start the loop, but it will show menu first
});

// Modify resizeCanvas function
function resizeCanvas() {
    const size = Math.min(window.innerHeight, window.innerHeight);  // Keep it square
    canvas.width = size;
    canvas.height = size;
    renderCanvas.width = Math.floor(size * RESOLUTION_SCALE);
    renderCanvas.height = Math.floor(size * RESOLUTION_SCALE);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Remove all pointer lock related code and comments

// Replace the map constant with larger map
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,0,1,1,0,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,0,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Update player starting position to middle of map
const player = {
    x: 11.5,   // Middle of map
    y: 11.5,   // Middle of map
    angle: 0,
    speed: 0.05,        // Halved from 0.1
    rotationSpeed: 0.1,
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    staminaRegenRate: 0.5,
    sprintSpeed: 0.1,    // Normal speed is 0.05
    isSprinting: false
};

// Simplify enemy AI initialization
const enemies = [
    {
        x: 3.5,
        y: 3.5,
        speed: 0.015,
        damage: 10,
        lastAttack: 0,
        attackCooldown: 800,
        ai: { lastPosition: { x: 0, y: 0 }, stuckTimer: 0, preferredDirection: null, directionTimer: 0 }
    },
    {
        x: 11.5,  // Middle area
        y: 7.5,
        speed: 0.015,   // Halved from 0.03
        damage: 10,
        lastAttack: 0,
        attackCooldown: 800,
        ai: { lastPosition: { x: 0, y: 0 }, stuckTimer: 0, preferredDirection: null, directionTimer: 0 }
    },
    {
        x: 20.5,  // Far right area
        y: 13.5,
        speed: 0.015,   // Halved from 0.03
        damage: 10,
        lastAttack: 0,
        attackCooldown: 800,
        ai: { lastPosition: { x: 0, y: 0 }, stuckTimer: 0, preferredDirection: null, directionTimer: 0 }
    }
];

// Replace key and door positions with new coordinates
const key = {
    x: 1.5,
    y: 21.5,  // Bottom left corner in open area
    collected: false
};

const door = {
    x: 22.5,
    y: 1.5,  // Top right corner in open area
    isOpen: false
};

const COLLISION_BUFFER = 0.2;

function checkCollision(x, y) {
    const mapX = Math.floor(x);
    const mapY = Math.floor(y);
    
    // Check if position is inside a wall
    if (map[mapY]?.[mapX] === 1) return true;
    
    // Check surrounding cells for nearby walls
    for (let offsetY = -1; offsetY <= 1; offsetY++) {
        for (let offsetX = -1; offsetX <= 1; offsetX++) {
            const checkX = Math.floor(x + offsetX * COLLISION_BUFFER);
            const checkY = Math.floor(y + offsetY * COLLISION_BUFFER);
            if (map[checkY]?.[checkX] === 1) {
                const distX = x - (checkX + 0.5);
                const distY = y - (checkY + 0.5);
                if (Math.sqrt(distX * distX + distY * distY) < COLLISION_BUFFER) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Add collision detection for entities
function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Replace findPathAroundWall and findAlternativePath with this new function
function findBestDirection(fromX, fromY, toX, toY) {
    const directions = [
        { angle: 0, priority: 0 },
        { angle: Math.PI/4, priority: 0 },
        { angle: -Math.PI/4, priority: 0 },
        { angle: Math.PI/2, priority: 0 },
        { angle: -Math.PI/2, priority: 0 },
        { angle: 3*Math.PI/4, priority: 0 },
        { angle: -3*Math.PI/4, priority: 0 },
        { angle: Math.PI, priority: 0 }
    ];

    const baseAngle = Math.atan2(toY - fromY, toX - fromX);
    
    // Score each direction
    directions.forEach(dir => {
        const testAngle = baseAngle + dir.angle;
        const testX = fromX + Math.cos(testAngle);
        const testY = fromY + Math.sin(testAngle);
        
        // Higher priority if path is clear
        if (!checkCollision(testX, testY)) {
            dir.priority += 2;
        }
        
        // Higher priority if closer to target
        const currentDist = getDistance(fromX, fromY, toX, toY);
        const newDist = getDistance(testX, testY, toX, toY);
        if (newDist < currentDist) {
            dir.priority += 1;
        }
    });

    // Sort by priority and return best direction
    directions.sort((a, b) => b.priority - a.priority);
    return baseAngle + directions[0].angle;
}

function clearScreen() {
    // Draw sky (black)
    renderCtx.fillStyle = '#000000';
    renderCtx.fillRect(0, 0, renderCanvas.width, renderCanvas.height/2);
    
    // Draw floor (black)
    renderCtx.fillStyle = '#000000';
    renderCtx.fillRect(0, renderCanvas.height/2, renderCanvas.width, renderCanvas.height/2);
}

// After other canvas initializations, add:
const textureCanvas = document.createElement('canvas');
const textureCtx = textureCanvas.getContext('2d');
textureCanvas.width = 1;
textureCanvas.height = TEXTURE_SIZE;

// Replace the entire castRays function with this simpler version
function castRays() {
    const rayCount = renderCanvas.width;
    const depthBuffer = new Array(rayCount).fill(Infinity);

    // Camera direction and plane
    const dirX = Math.cos(player.angle);
    const dirY = Math.sin(player.angle);
    const planeX = -dirY * PLANE_Y;  // Camera plane perpendicular to direction
    const planeY = dirX * PLANE_Y;

    // Render walls
    for (let x = 0; x < rayCount; x++) {
        // Calculate ray position and direction
        const cameraX = 2 * x / rayCount - 1;
        const rayDirX = dirX + planeX * cameraX;
        const rayDirY = dirY + planeY * cameraX;
        
        const [perpWallDist, wallX, isEnemy, side] = castRay(rayDirX, rayDirY);
        depthBuffer[x] = perpWallDist;

        if (!isEnemy) {
            // Clamp distance and calculate proper wall height
            const adjustedDist = Math.max(MIN_WALL_DIST, perpWallDist);
            
            // Calculate wall height with clamping
            let wallHeight = Math.floor(renderCanvas.height / adjustedDist);
            wallHeight = Math.min(wallHeight, renderCanvas.height * MAX_WALL_HEIGHT);
            
            // Calculate drawing boundaries
            const drawStart = Math.max(0, Math.floor((renderCanvas.height - wallHeight) / 2));
            const drawEnd = Math.min(renderCanvas.height - 1, drawStart + wallHeight);
            
            // Calculate texture coordinates
            const textureX = Math.floor(wallX * wallTexture.width);
            
            // Calculate texture scaling
            const texturePortion = wallTexture.height * (drawEnd - drawStart) / renderCanvas.height;
            const textureStep = wallTexture.height / (drawEnd - drawStart);
            
            // Draw wall slice with proper texture scaling
            renderCtx.drawImage(
                wallTexture,
                textureX, 0,
                1, wallTexture.height,
                x, drawStart,
                1, drawEnd - drawStart
            );
            
            // Apply shading
            const brightness = Math.max(0, 1 - (adjustedDist / FOG_DISTANCE));
            renderCtx.fillStyle = `rgba(0,0,0,${1 - brightness})`;
            renderCtx.fillRect(x, drawStart, 1, drawEnd - drawStart);
        }
    }

    // Improved enemy rendering
    enemies.forEach(enemy => {
        const enemyDist = getDistance(player.x, player.y, enemy.x, enemy.y);
        const enemyAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        const relativeAngle = normalizeAngle(enemyAngle - player.angle);
        
        // Check if enemy is in field of view
        if (Math.abs(relativeAngle) < FOV / 1.5) {  // Slightly wider than FOV to prevent pop-in
            const screenX = Math.tan(relativeAngle) / Math.tan(FOV / 2);
            const enemyScreenPos = ((screenX + 1) / 2) * renderCanvas.width;
            const enemyScale = getBillboardScale(enemyDist);
            // Adjust size multiplier from 0.7 to 0.9
            const enemyHeight = (enemyTexture.height * enemyScale) * 0.9;
            const enemyWidth = (enemyTexture.width * enemyScale) * 0.9;
            const enemyY = (renderCanvas.height - enemyHeight) / 2;
            const screenXPos = enemyScreenPos - enemyWidth/2;

            // Check multiple points for visibility
            const checkPoints = [
                Math.floor(enemyScreenPos - enemyWidth/4),
                Math.floor(enemyScreenPos),
                Math.floor(enemyScreenPos + enemyWidth/4)
            ];

            let isVisible = false;
            for (const x of checkPoints) {
                if (x >= 0 && x < depthBuffer.length && enemyDist < depthBuffer[x]) {
                    isVisible = true;
                    break;
                }
            }

            // Modify enemy shading in the enemy rendering section
            if (isVisible) {
                // Create temporary canvas for enemy rendering
                const enemyCanvas = document.createElement('canvas');
                enemyCanvas.width = enemyWidth;
                enemyCanvas.height = enemyHeight;
                const enemyCtx = enemyCanvas.getContext('2d', { willReadFrequently: true });
                
                // Draw enemy to temporary canvas
                enemyCtx.drawImage(
                    enemyTexture,
                    0, 0,
                    enemyWidth, enemyHeight
                );
                
                // Get image data to manipulate pixels
                const imageData = enemyCtx.getImageData(0, 0, enemyWidth, enemyHeight);
                const data = imageData.data;
                
                // Calculate brightness based on distance
                const brightness = Math.max(0, 1 - (enemyDist / FOG_DISTANCE));
                
                // Modify each pixel's RGB while preserving alpha
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3] > 0) {  // Only shade non-transparent pixels
                        data[i] *= brightness;     // R
                        data[i + 1] *= brightness; // G
                        data[i + 2] *= brightness; // B
                    }
                }
                
                // Put the modified image data back
                enemyCtx.putImageData(imageData, 0, 0);
                
                // Draw the shaded enemy sprite
                renderCtx.save();
                renderCtx.globalCompositeOperation = 'source-over';
                renderCtx.drawImage(enemyCanvas, screenXPos, enemyY);
                renderCtx.restore();
            }
        }
    });

    // Render key if not collected
    if (!key.collected) {
        const keyDist = getDistance(player.x, player.y, key.x, key.y);
        const keyAngle = Math.atan2(key.y - player.y, key.x - player.x);
        const keyRelativeAngle = normalizeAngle(keyAngle - player.angle);
        
        if (Math.abs(keyRelativeAngle) < FOV / 1.5) {
            const keyScreenX = Math.tan(keyRelativeAngle) / Math.tan(FOV / 2);
            const keyScreenPos = ((keyScreenX + 1) / 2) * renderCanvas.width;
            const keyScale = getBillboardScale(keyDist);
            const keySize = keyTexture.height * keyScale * 0.3;  // Smaller than enemy
            const keyY = (renderCanvas.height - keySize) / 2;
            const keyX = keyScreenPos - keySize/2;

            if (keyDist < depthBuffer[Math.floor(keyScreenPos)]) {
                renderCtx.drawImage(keyTexture, keyX, keyY, keySize, keySize);
            }
        }
    }

    // Render door
    const doorDist = getDistance(player.x, player.y, door.x, door.y);
    const doorAngle = Math.atan2(door.y - player.y, door.x - player.x);
    const doorRelativeAngle = normalizeAngle(doorAngle - player.angle);
    
    if (Math.abs(doorRelativeAngle) < FOV / 1.5) {
        const doorScreenX = Math.tan(doorRelativeAngle) / Math.tan(FOV / 2);
        const doorScreenPos = ((doorScreenX + 1) / 2) * renderCanvas.width;
        const doorScale = getBillboardScale(doorDist);
        const doorHeight = doorTexture.height * doorScale;
        const doorWidth = doorTexture.width * doorScale;
        const doorY = (renderCanvas.height - doorHeight) / 2;
        const doorX = doorScreenPos - doorWidth/2;

        if (doorDist < depthBuffer[Math.floor(doorScreenPos)]) {
            renderCtx.drawImage(doorTexture, doorX, doorY, doorWidth, doorHeight);
        }
    }

    // Final pass: scale low-res render to full size display
    ctx.imageSmoothingEnabled = false; // Keep pixelated look
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
        renderCanvas,
        0, 0,
        renderCanvas.width, renderCanvas.height,
        0, 0,
        canvas.width, canvas.height
    );
}

// Replace castRay function with DDA implementation
function castRay(rayDirX, rayDirY) {
    let mapX = Math.floor(player.x);
    let mapY = Math.floor(player.y);
    
    // Calculate ray step and initial sideDist
    const deltaDistX = Math.abs(1 / rayDirX);
    const deltaDistY = Math.abs(1 / rayDirY);

    let stepX, stepY, sideDistX, sideDistY;
    
    if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (player.x - mapX) * deltaDistX;
    } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - player.x) * deltaDistX;
    }
    
    if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (player.y - mapY) * deltaDistY;
    } else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - player.y) * deltaDistY;
    }

    // DDA algorithm
    let hit = false;
    let side;
    
    while (!hit) {
        if (sideDistX < sideDistY) {
            sideDistX += deltaDistX;
            mapX += stepX;
            side = 0;
        } else {
            sideDistY += deltaDistY;
            mapY += stepY;
            side = 1;
        }
        
        if (map[mapY]?.[mapX] === 1) hit = true;
    }

    // Calculate perpendicular wall distance (avoiding fish-eye effect)
    let perpWallDist;
    if (side === 0) {
        perpWallDist = (mapX - player.x + (1 - stepX) / 2) / rayDirX;
    } else {
        perpWallDist = (mapY - player.y + (1 - stepY) / 2) / rayDirY;
    }

    // Calculate wall X coordinate (for texturing)
    let wallX;
    if (side === 0) {
        wallX = player.y + perpWallDist * rayDirY;
    } else {
        wallX = player.x + perpWallDist * rayDirX;
    }
    wallX -= Math.floor(wallX);

    // Correct texture coordinate based on wall side
    if ((side === 0 && rayDirX < 0) || (side === 1 && rayDirY > 0)) {
        wallX = 1 - wallX;
    }

    return [perpWallDist, wallX, false, side];
}

// Modify getBillboardScale function for medium sizing
function getBillboardScale(distance) {
    return Math.min(0.8, 0.5 / Math.max(0.1, distance));
}

function gameLoop() {
    if (gameState.isStartMenu) {
        drawStartMenu();
    } else if (gameState.hasWon) {
        drawWinScreen();
    } else if (!gameState.isGameOver) {
        clearScreen();
        updateEnemies();  // Updated to handle multiple enemies
        castRays();
        // Scale up the render canvas to the display canvas
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            renderCanvas,
            0, 0,
            renderCanvas.width, renderCanvas.height,
            0, 0,
            canvas.width, canvas.height
        );
        drawHUD();
        // Removed minimap rendering
    } else {
        drawGameOver();
    }
    requestAnimationFrame(gameLoop);
}

// Handle keyboard input
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.code === 'Space') {
        if (gameState.isStartMenu) {
            gameState.isStartMenu = false;
            bgMusic.play();  // Start music when game starts
        } else if (gameState.isGameOver && !gameState.restartPressed) {
            gameState.restartPressed = true;
            restartGame();
        }
    }
});
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Update handleInput function to check stamina before allowing sprint
// Replace handleInput function with this improved version
function handleInput() {
    if (gameState.isGameOver || gameState.hasWon) return;
    let newX = player.x;
    let newY = player.y;

    // Update sprinting state and speed
    player.isSprinting = keys['Shift'] && player.stamina > 5;
    const currentSpeed = player.isSprinting ? player.sprintSpeed : player.speed;

    // Calculate turn speed with sprint penalty
    const currentTurnSpeed = player.isSprinting ? 
        player.rotationSpeed * SPRINT_TURN_PENALTY : 
        player.rotationSpeed;

    // Movement controls
    if (keys['ArrowUp'] || keys['w']) {
        newX += Math.cos(player.angle) * currentSpeed;
        newY += Math.sin(player.angle) * currentSpeed;
    }
    if (keys['ArrowDown'] || keys['s']) {
        newX -= Math.cos(player.angle) * currentSpeed;
        newY -= Math.sin(player.angle) * currentSpeed;
    }

    // Turning with speed limits and normalization
    let turnAmount = 0;
    if (keys['a'] || keys['A']) turnAmount -= currentTurnSpeed;
    if (keys['d'] || keys['D']) turnAmount += currentTurnSpeed;

    // Apply turn with speed limit
    turnAmount = Math.max(-MAX_TURN_SPEED, Math.min(MAX_TURN_SPEED, turnAmount));
    player.angle = normalizeAngle(player.angle + turnAmount);

    // Only update position if new position is valid
    if (!checkCollision(newX, player.y)) {
        player.x = newX;
    }
    if (!checkCollision(player.x, newY)) {
        player.y = newY;
    }

    // Test controls for health
    if (keys['h']) {
        healPlayer(10);  // Press H to heal
    }
    if (keys['j']) {
        damagePlayer(10);  // Press J to take damage
    }

    // Check for key collection
    if (!key.collected) {
        const distToKey = getDistance(player.x, player.y, key.x, key.y);
        if (distToKey < 0.5) {
            key.collected = true;
            gameState.hasKey = true;
        }
    }

    // Check for door interaction
    if (gameState.hasKey) {
        const distToDoor = getDistance(player.x, player.y, door.x, door.y);
        if (distToDoor < 0.5) {
            door.isOpen = true;
            gameState.hasWon = true;
            bgMusic.pause(); // Stop music on win
        }
    }

    // Update stamina only for movement actions, stop sprint if stamina is too low
    if (player.isSprinting && (keys['ArrowUp'] || keys['w'] || keys['ArrowDown'] || keys['s'])) {
        player.stamina = Math.max(0, player.stamina - 1);
        if (player.stamina <= 0) {
            player.isSprinting = false;  // Force stop sprinting when stamina runs out
        }
    } else if (!keys['Shift']) { // Only regenerate if Shift is not held
        player.stamina = Math.min(player.maxStamina, player.stamina + player.staminaRegenRate);
    }
}

// Replace the updateEnemies function with this improved version
function updateEnemies() {
    if (gameState.isGameOver) return;
    
    enemies.forEach(enemy => {
        const distance = getDistance(enemy.x, enemy.y, player.x, player.y);
        
        // Only move if not too close to player
        if (distance > 0.5) {
            // Check if we're stuck
            const movement = getDistance(enemy.x, enemy.y, enemy.ai.lastPosition.x, enemy.ai.lastPosition.y);
            if (movement < 0.01) {
                enemy.ai.stuckTimer++;
            } else {
                enemy.ai.stuckTimer = 0;
                enemy.ai.lastPosition = { x: enemy.x, y: enemy.y };
            }

            let moveAngle;
            
            // Try to find a path to the player
            const directAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            
            // Check multiple points ahead to detect walls
            const checkDistance = 0.5; // How far ahead to check
            const numRays = 8; // Number of rays to check
            const angles = [];
            
            // Generate angles to check, centered on direct path to player
            for (let i = 0; i < numRays; i++) {
                const rayAngle = directAngle - Math.PI/3 + (Math.PI*2/3) * (i/(numRays-1));
                const rayX = enemy.x + Math.cos(rayAngle) * checkDistance;
                const rayY = enemy.y + Math.sin(rayAngle) * checkDistance;
                
                // Score this angle based on clearance and direction to player
                let score = 0;
                
                // Higher score if path is clear
                if (!checkCollision(rayX, rayY)) {
                    score += 2;
                }
                
                // Higher score if closer to direct path to player
                const angleDiff = Math.abs(normalizeAngle(rayAngle - directAngle));
                score += (Math.PI - angleDiff) / Math.PI;
                
                angles.push({ angle: rayAngle, score });
            }
            
            // Sort angles by score and pick the best one
            angles.sort((a, b) => b.score - a.score);
            moveAngle = angles[0].angle;
            
            // If stuck, modify behavior
            if (enemy.ai.stuckTimer > 20) {
                // Try moving perpendicular to current direction
                const perpendicularAngle = moveAngle + Math.PI/2;
                enemy.ai.preferredDirection = Math.random() < 0.5 ? perpendicularAngle : perpendicularAngle + Math.PI;
                enemy.ai.directionTimer = 30;
                enemy.ai.stuckTimer = 0;
                moveAngle = enemy.ai.preferredDirection;
            } else if (enemy.ai.directionTimer > 0) {
                moveAngle = enemy.ai.preferredDirection;
                enemy.ai.directionTimer--;
            }

            // Apply movement with smaller steps
            const steps = 4; // Break movement into smaller steps
            for (let i = 0; i < steps; i++) {
                const stepSize = enemy.speed / steps;
                const newX = enemy.x + Math.cos(moveAngle) * stepSize;
                const newY = enemy.y + Math.sin(moveAngle) * stepSize;
                
                // Only update position if new position is valid
                if (!checkCollision(newX, enemy.y)) {
                    enemy.x = newX;
                }
                if (!checkCollision(enemy.x, newY)) {
                    enemy.y = newY;
                }
            }
        }
        
        // Attack logic
        if (distance < 1 && Date.now() - enemy.lastAttack > enemy.attackCooldown) {
            damagePlayer(enemy.damage);
            enemy.lastAttack = Date.now();
        }
    });
}

// Add this helper function near the other utility functions
function isPathClear(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 2;
    
    for (let i = 0; i <= steps; i++) {
        const x = fromX + (dx * i / steps);
        const y = fromY + (dy * i / steps);
        if (checkCollision(x, y)) {
            return false;
        }
    }
    return true;
}

// Add HUD rendering function
function drawHUD() {
    // Health bar background
    ctx.fillStyle = '#333';
    ctx.fillRect(20, canvas.height - 40, 200, 20);
    
    // Health bar
    const healthPercent = player.health / player.maxHealth;
    const healthColor = `rgb(${255 * (1 - healthPercent)}, ${255 * healthPercent}, 0)`;
    ctx.fillStyle = healthColor;
    ctx.fillRect(20, canvas.height - 40, 200 * healthPercent, 20);
    
    // Stamina bar background
    ctx.fillStyle = '#333';
    ctx.fillRect(20, canvas.height - 70, 200, 20);
    
    // Stamina bar
    const staminaPercent = player.stamina / player.maxStamina;
    ctx.fillStyle = `rgb(255, 255, ${Math.floor(255 * (1 - staminaPercent))})`;  // Yellow to white
    ctx.fillRect(20, canvas.height - 70, 200 * staminaPercent, 20);
    
    // HUD text
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(`Health: ${Math.floor(player.health)}`, 25, canvas.height - 25);
    ctx.fillText(`Stamina: ${Math.floor(player.stamina)}`, 25, canvas.height - 55);
}

// Modify damagePlayer function
function damagePlayer(amount) {
    player.health = Math.max(0, player.health - amount);
    if (player.health <= 0) {
        gameState.isGameOver = true;
        bgMusic.pause(); // Stop music on game over
    }
}

// Add healing function (optional - for testing)
function healPlayer(amount) {
    player.health = Math.min(player.maxHealth, player.health + amount);
}

// Add game over screen rendering
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 48px Arial';
    const gameOverText = 'GAME OVER';
    const textMetrics = ctx.measureText(gameOverText);
    ctx.fillText(gameOverText, 
        (canvas.width - textMetrics.width) / 2,
        canvas.height / 2);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    const restartText = 'Press SPACE to restart';
    const restartMetrics = ctx.measureText(restartText);
    ctx.fillText(restartText,
        (canvas.width - restartMetrics.width) / 2,
        canvas.height / 2 + 50);
}

// Replace drawWinScreen function with:
function drawWinScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions to maintain aspect ratio
    const scale = Math.min(canvas.width / winTexture.width, canvas.height / winTexture.height) * 0.8;
    const width = winTexture.width * scale;
    const height = winTexture.height * scale;
    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;
    
    // Draw the win image
    ctx.drawImage(winTexture, x, y, width, height);
    
    // Draw the win text below the image
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 48px Arial';
    const winText = 'YOU WIN!';
    const textMetrics = ctx.measureText(winText);
    ctx.fillText(winText, 
        (canvas.width - textMetrics.width) / 2,
        y + height + 50);
}

// Update restartGame function's enemy position reset
function restartGame() {
    player.health = player.maxHealth;
    player.x = 11.5;  // Middle of map
    player.y = 11.5;  // Middle of map
    player.angle = 0;
    enemies[0].x = 3.5; enemies[0].y = 3.5;
    enemies[1].x = 11.5; enemies[1].y = 7.5;
    enemies[2].x = 20.5; enemies[2].y = 13.5;
    enemies.forEach(enemy => {
        enemy.lastAttack = 0;
        enemy.ai = { lastPosition: { x: 0, y: 0 }, stuckTimer: 0, preferredDirection: null, directionTimer: 0 };
    });
    gameState.isGameOver = false;
    gameState.restartPressed = false;
    key.collected = false;
    door.isOpen = false;
    gameState.hasKey = false;
    gameState.hasWon = false;
    player.stamina = player.maxStamina;
    player.isSprinting = false;
    gameState.isStartMenu = true;  // Return to start menu
    bgMusic.currentTime = 0; // Restart music from beginning
    bgMusic.play();
}

setInterval(handleInput, 1000/60);

// Add this helper function near the top
// Update normalizeAngle function to be more robust
function normalizeAngle(angle) {
    angle = angle % TWO_PI;
    return angle < 0 ? angle + TWO_PI : angle;
}

// Update the drawStartMenu function with better title formatting
function drawStartMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw multi-line title
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 72px Arial';
    const titleText1 = 'ITZSUBZ';
    const titleText2 = 'BASEMENT';
    const titleText3 = 'ESCAPE';
    
    const title1Metrics = ctx.measureText(titleText1);
    const title2Metrics = ctx.measureText(titleText2);
    const title3Metrics = ctx.measureText(titleText3);
    
    ctx.fillText(titleText1, 
        (canvas.width - title1Metrics.width) / 2,
        canvas.height / 4);
    ctx.fillText(titleText2, 
        (canvas.width - title2Metrics.width) / 2,
        canvas.height / 4 + 80);
    ctx.fillText(titleText3, 
        (canvas.width - title3Metrics.width) / 2,
        canvas.height / 4 + 160);
    
    // Draw play button
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    const playText = 'Press SPACE to Play';
    const playMetrics = ctx.measureText(playText);
    ctx.fillText(playText,
        (canvas.width - playMetrics.width) / 2,
        canvas.height / 2 + 80);
    
    // Draw controls
    ctx.font = '20px Arial';
    const controls = [
        'Controls:',
        'WASD / Arrow Keys - Move',
        'Shift - Sprint',
        'Find the jar and reach subz!'
    ];
    
    controls.forEach((text, index) => {
        const metrics = ctx.measureText(text);
        ctx.fillText(text,
            (canvas.width - metrics.width) / 2,
            canvas.height * 0.7 + index * 30);
    });
}
