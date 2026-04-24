const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: true });

let mx = 0, my = 0;
window.frozen = false;
window.worldSpeed = 1;

// CAMERA
let camera = { x: 0, y: 0, zoom: 1.0 };

function worldToScreen(wx, wy) {
    return {
        x: (wx - camera.x) * camera.zoom + canvas.width / 2,
        y: (wy - camera.y) * camera.zoom + canvas.height / 2
    };
}

function screenToWorld(sx, sy) {
    return {
        x: (sx - canvas.width / 2) / camera.zoom + camera.x,
        y: (sy - canvas.height / 2) / camera.zoom + camera.y
    };
}

// === SVG SKINS ===
const playerSkin = new Image();
const enemySkin = new Image();
playerSkin.src = "SVGs/menu/human attacker spaceship.svg";
enemySkin.src = "SVGs/menu/alien attacker spaceship.svg";

function drawRotatedImage(img, x, y, angle, size) {
    const pos = worldToScreen(x, y);
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
}

// ====================== SPACESHIP ======================
class Spaceship {
    constructor() { this.reset(); }
    reset() {
        this.x = 0; this.y = 0;
        this.vx = 0; this.vy = 0;
        this.angle = 0;
        this.thrustPower = 0;
        this.size = 64;
    }
    update(dt) {
        const accel = 260; // vyšší akcelerace
        const ax = Math.cos(this.angle) * this.thrustPower * accel;
        const ay = Math.sin(this.angle) * this.thrustPower * accel;
        this.vx += ax * dt;
        this.vy += ay * dt;

        // lehčí tlumení, aby si udržela rychlost
        this.vx *= 0.97;
        this.vy *= 0.97;

        // limit maximální rychlosti
        const maxSpeed = 420;
        const speed = Math.hypot(this.vx, this.vy);
        if (speed > maxSpeed) {
            const k = maxSpeed / speed;
            this.vx *= k;
            this.vy *= k;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.thrustPower *= 0.92;
    }
    drawThrusters() {
        if (this.thrustPower <= 0.05) return;

        const baseAlpha = Math.min(1, this.thrustPower * 1.4);
        const lenBase = this.size * (1.0 + Math.random() * 0.7);

        // dvě trysky vzadu (Triska 1, Triska 2)
        const thrusters = [
            { x: -this.size * 0.45, y: -this.size * 0.18 },
            { x: -this.size * 0.45, y:  this.size * 0.18 }
        ];

        const pos = worldToScreen(this.x, this.y);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(this.angle);

        for (const t of thrusters) {
            const wobble = (Math.random() - 0.5) * this.size * 0.15;
            const len = lenBase * (0.9 + Math.random() * 0.3);

            const grad = ctx.createLinearGradient(t.x, t.y, t.x - len, t.y);
            grad.addColorStop(0, `rgba(255,230,160,${baseAlpha})`);
            grad.addColorStop(0.4, `rgba(255,160,40,${baseAlpha * 0.9})`);
            grad.addColorStop(1, `rgba(60,120,255,0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(t.x, t.y - this.size * 0.10);
            ctx.lineTo(t.x - len, t.y + wobble);
            ctx.lineTo(t.x, t.y + this.size * 0.10);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
    draw() {
        drawRotatedImage(playerSkin, this.x, this.y, this.angle, this.size);
        this.drawThrusters();
    }
}

let ship = null;

// ====================== ENEMIES / BULLETS / EXPLOSIONS ======================
class Enemy {
    constructor() { this.reset(); }
    reset() {
        this.x = (Math.random() - 0.5) * 1200;
        this.y = (Math.random() - 0.5) * 1200;
        this.vx = (Math.random() - 0.5) * 40;
        this.vy = (Math.random() - 0.5) * 40;
        this.size = 64;
        this.angle = 0;
        this.shootTimer = 2 + Math.random() * 4; // 2–6 s
    }
    update(dt) {
        if (ship) {
            const dx = ship.x - this.x;
            const dy = ship.y - this.y;
            const dist = Math.hypot(dx, dy) || 1;
            const accel = 40;
            this.vx += (dx / dist) * accel * dt;
            this.vy += (dy / dist) * accel * dt;
        }
        this.vx *= 0.97;
        this.vy *= 0.97;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.angle = Math.atan2(this.vy, this.vx);
        wrapObject(this);

        this.shootTimer -= dt;
        if (this.shootTimer <= 0 && ship) {
            this.shootAtShip();
            this.shootTimer = 3 + Math.random() * 5; // 3–8 s
        }
    }
    shootAtShip() {
        const dx = ship.x - this.x;
        const dy = ship.y - this.y;
        const baseAngle = Math.atan2(dy, dx);
        const spread = (Math.random() - 0.5) * (Math.PI / 18); // ±10°
        const ang = baseAngle + spread;
        const speed = 260;

        // zbraně – posunuty dál ke konci křídla
        const guns = [
            { x: this.size * 0.50, y: -this.size * 0.16 },
            { x: this.size * 0.50, y:  this.size * 0.16 }
        ];

        for (const g of guns) {
            const cosA = Math.cos(this.angle);
            const sinA = Math.sin(this.angle);
            const wx = this.x + cosA * g.x - sinA * g.y;
            const wy = this.y + sinA * g.x + cosA * g.y;

            const vx = Math.cos(ang) * speed;
            const vy = Math.sin(ang) * speed;
            enemyBullets.push(new EnemyBullet(wx, wy, vx, vy));
        }
    }
    draw() {
        drawRotatedImage(enemySkin, this.x, this.y, this.angle, this.size);
    }
}

class Bullet {
    constructor(x, y, vx, vy) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.life = 1.2;
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        wrapObject(this);
    }
    draw() {
        const pos = worldToScreen(this.x, this.y);
        ctx.save();
        ctx.fillStyle = 'rgba(255,240,120,0.9)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3 * camera.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class EnemyBullet {
    constructor(x, y, vx, vy) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.life = 2.5;
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        wrapObject(this);
    }
    draw() {
        const pos = worldToScreen(this.x, this.y);
        ctx.save();
        ctx.fillStyle = 'rgba(255,80,80,0.9)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3 * camera.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ExplosionParticle {
    constructor(x, y) {
        this.x = x; this.y = y;
        const a = Math.random() * Math.PI * 2;
        const s = 80 + Math.random() * 140;
        this.vx = Math.cos(a) * s;
        this.vy = Math.sin(a) * s;
        this.life = 0.6 + Math.random() * 0.4;
        this.maxLife = this.life;
        this.size = 4 + Math.random() * 6;
        this.hue = 20 + Math.random() * 40;
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vx *= 0.9;
        this.vy *= 0.9;
        this.life -= dt;
    }
    draw() {
        const pos = worldToScreen(this.x, this.y);
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.fillStyle = `hsla(${this.hue},80%,60%,${alpha})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.size * camera.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let enemies = [];
let bullets = [];
let enemyBullets = [];
let explosions = [];

function spawnEnemy() {
    const e = new Enemy();
    enemies.push(e);
}

function spawnExplosion(x, y) {
    for (let i = 0; i < 24; i++) {
        explosions.push(new ExplosionParticle(x, y));
    }
}

// ====================== BACKGROUND ======================
class Star {
    constructor(depth) {
        this.depth = depth;
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.r = this.depth < 2 ? Math.random()*1.8 + 0.8 :
                 this.depth < 4 ? Math.random()*1.2 + 0.4 : Math.random()*0.8 + 0.3;
        this.phase = Math.random() * Math.PI * 2;
        this.temp = Math.random();
    }
    update(dt) { this.phase += dt * 0.25 / this.depth; }
    draw() {
        const p = { x: mx * 50 / this.depth, y: my * 50 / this.depth };
        const a = 0.5 + Math.sin(this.phase) * 0.2;
        let color = this.temp < 0.15 ? `rgba(255,200,180,${a})` :
                    this.temp > 0.85 ? `rgba(180,200,255,${a})` : `rgba(255,255,255,${a})`;
        ctx.fillStyle = color;
        ctx.fillRect(this.x + p.x, this.y + p.y, this.r, this.r);
    }
}

class Galaxy {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = 180 + Math.random() * 220;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.015;
        this.hue = 200 + Math.random() * 40;
    }
    update(dt) { this.angle += this.spin * dt; }
    draw() {
        const p = { x: mx * 50 / 8, y: my * 50 / 8 };
        ctx.save();
        ctx.translate(this.x + p.x, this.y + p.y);
        ctx.rotate(this.angle);
        const grad = ctx.createRadialGradient(0,0,0,0,0,this.radius);
        grad.addColorStop(0, `hsla(${this.hue},70%,75%,0.18)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0,0,this.radius*1.2, this.radius*0.8, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
}

class Dust {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.r = 350 + Math.random() * 400;
        this.h = 210 + Math.random() * 60;
    }
    draw() {
        const p = { x: mx * 50 / 12, y: my * 50 / 12 };
        const g = ctx.createRadialGradient(this.x+p.x, this.y+p.y, 0, this.x+p.x, this.y+p.y, this.r);
        g.addColorStop(0, `hsla(${this.h},50%,45%,0.025)`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x+p.x, this.y+p.y, this.r, 0, Math.PI*2);
        ctx.fill();
    }
}

class ForegroundParticle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random()-0.5)*40;
        this.vy = (Math.random()-0.5)*40;
        this.size = Math.random()*2 + 1.5;
        this.alpha = 0.3 + Math.random()*0.4;
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (this.x < -100 || this.x > canvas.width + 100 || this.y < -100 || this.y > canvas.height + 100) this.reset();
    }
    draw() {
        const p = { x: mx * 50 / 0.8, y: my * 50 / 0.8 };
        ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
        ctx.fillRect(this.x + p.x, this.y + p.y, this.size, this.size);
    }
}

// Vytvoření objektů
const closeStars = Array.from({length: 120}, () => new Star(1.5));
const midStars   = Array.from({length: 500}, () => new Star(3));
const farStars   = Array.from({length: 900}, () => new Star(6));
const galaxies   = Array.from({length: 3}, () => new Galaxy());
const dusts      = Array.from({length: 2}, () => new Dust());
const foreground = Array.from({length: 80}, () => new ForegroundParticle());

let last = performance.now();

// MOUSE CONTROLS
let isDragging = false;
let lastMouseX = 0, lastMouseY = 0;

canvas.addEventListener('mousemove', e => {
    mx = (e.clientX / canvas.width - 0.5) * 2;
    my = (e.clientY / canvas.height - 0.5) * 2;

    if (isDragging) {
        const dx = (e.clientX - lastMouseX) / camera.zoom;
        const dy = (e.clientY - lastMouseY) / camera.zoom;
        camera.x -= dx;
        camera.y -= dy;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});

canvas.addEventListener('mousedown', e => {
    if (e.button === 0) {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});
canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

canvas.addEventListener('wheel', e => {
    const before = screenToWorld(e.clientX, e.clientY);
    camera.zoom *= Math.exp(-e.deltaY * 0.0015);
    camera.zoom = Math.max(0.15, Math.min(8, camera.zoom));
    const after = screenToWorld(e.clientX, e.clientY);
    camera.x += before.x - after.x;
    camera.y += before.y - after.y;
});

// DŮLEŽITÉ: Správný resize
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    closeStars.forEach(s => s.reset());
    midStars.forEach(s => s.reset());
    farStars.forEach(s => s.reset());
    galaxies.forEach(g => g.reset());
    dusts.forEach(d => d.reset());
    foreground.forEach(f => f.reset());
}
window.addEventListener('resize', resize);
resize();

// pomocná funkce pro wrap v závislosti na kameře a zoomu
function wrapObject(obj) {
    const halfW = canvas.width / (2 * camera.zoom);
    const halfH = canvas.height / (2 * camera.zoom);
    if (obj.x < camera.x - halfW) obj.x = camera.x + halfW;
    if (obj.x > camera.x + halfW) obj.x = camera.x - halfW;
    if (obj.y < camera.y - halfH) obj.y = camera.y + halfH;
    if (obj.y > camera.y + halfH) obj.y = camera.y - halfH;
}

// KEYBOARD (plynulé ovládání lodě)
const keyState = {};
document.addEventListener('keydown', e => {
    keyState[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', e => {
    keyState[e.key.toLowerCase()] = false;
});

// MAIN LOOP
function loop(t) {
    const dt = Math.min((t - last) / 1000, 0.1) * window.worldSpeed;
    last = t;

    if (!window.frozen) {
        galaxies.forEach(g => g.update(dt));
        farStars.forEach(s => s.update(dt));
        midStars.forEach(s => s.update(dt));
        closeStars.forEach(s => s.update(dt));
        foreground.forEach(f => f.update(dt));

        if (ship) {
            const rotSpeed = 2.8;
            if (keyState['a'] || keyState['arrowleft']) {
                ship.angle -= rotSpeed * dt;
            }
            if (keyState['d'] || keyState['arrowright']) {
                ship.angle += rotSpeed * dt;
            }
            if (keyState['w'] || keyState['arrowup']) {
                ship.thrustPower = 1;
            }
            if (keyState['s'] || keyState['arrowdown']) {
                const speed = Math.hypot(ship.vx, ship.vy);
                if (speed < 5) {
                    ship.vx = 0;
                    ship.vy = 0;
                } else {
                    ship.vx *= 0.85;
                    ship.vy *= 0.85;
                }
            }

            ship.update(dt);
            wrapObject(ship);
        }

        enemies.forEach(e => e.update(dt));
        bullets.forEach(b => b.update(dt));
        enemyBullets.forEach(b => b.update(dt));
        explosions.forEach(ex => ex.update(dt));

        // enemy separation (anti-clipping)
        const minDist = 40;
        for (let i = 0; i < enemies.length; i++) {
            for (let j = i + 1; j < enemies.length; j++) {
                const e1 = enemies[i];
                const e2 = enemies[j];
                const dx = e2.x - e1.x;
                const dy = e2.y - e1.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 0 && dist < minDist) {
                    const overlap = (minDist - dist) / 2;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    e1.x -= nx * overlap;
                    e1.y -= ny * overlap;
                    e2.x += nx * overlap;
                    e2.y += ny * overlap;
                }
            }
        }

        // bullet vs enemy collisions
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            if (b.life <= 0) {
                bullets.splice(i, 1);
                continue;
            }
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                const dx = e.x - b.x;
                const dy = e.y - b.y;
                const dist = Math.hypot(dx, dy);
                if (dist < e.size * 0.6) {
                    spawnExplosion(e.x, e.y);
                    enemies.splice(j, 1);
                    bullets.splice(i, 1);
                    break;
                }
            }
        }

        // enemy bullets vs ship
        if (ship) {
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const b = enemyBullets[i];
                if (b.life <= 0) {
                    enemyBullets.splice(i, 1);
                    continue;
                }
                const dx = ship.x - b.x;
                const dy = ship.y - b.y;
                const dist = Math.hypot(dx, dy);
                if (dist < ship.size * 0.5) {
                    spawnExplosion(ship.x, ship.y);
                    enemyBullets.splice(i, 1);
                }
            }
        }

        explosions = explosions.filter(ex => ex.life > 0);
        enemyBullets = enemyBullets.filter(b => b.life > 0);
    }

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    dusts.forEach(d => d.draw());
    galaxies.forEach(g => g.draw());
    farStars.forEach(s => s.draw());
    midStars.forEach(s => s.draw());
    closeStars.forEach(s => s.draw());
    foreground.forEach(f => f.draw());

    if (ship) ship.draw();
    enemies.forEach(e => e.draw());
    bullets.forEach(b => b.draw());
    enemyBullets.forEach(b => b.draw());
    explosions.forEach(ex => ex.draw());

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

// ====================== TERMINAL API ======================
window.spawnShip = function() {
    if (!ship) ship = new Spaceship();
    else ship.reset();
    camera.x = ship.x;
    camera.y = ship.y;
    return "✓ Spaceship created at (0, 0). Use console commands or WASD to control it.";
};

window.getShipStatus = function() {
    if (!ship) return "No ship spawned.";
    return `Position: (${ship.x.toFixed(1)}, ${ship.y.toFixed(1)})\nVelocity: (${ship.vx.toFixed(2)}, ${ship.vy.toFixed(2)})\nAngle: ${(ship.angle * 180 / Math.PI).toFixed(1)}°\nThrust: ${(ship.thrustPower*100).toFixed(1)}%`;
};

window.setThrust = function(val) {
    if (!ship) return "No ship. First use spawnship.";
    const v = parseFloat(val);
    if (isNaN(v)) return "Invalid number.";
    ship.thrustPower = Math.max(0, Math.min(1, v));
    return `Thrust set to ${(ship.thrustPower*100).toFixed(0)}%`;
};

window.setBrake = function(val) {
    if (!ship) return "No ship.";
    const v = parseFloat(val);
    if (isNaN(v)) return "Invalid number.";
    const f = Math.max(0, Math.min(1, v)) * 0.9;
    ship.vx *= (1 - f);
    ship.vy *= (1 - f);
    return `Brake applied.`;
};

window.setRotate = function(deg) {
    if (!ship) return "No ship.";
    const d = parseFloat(deg) || 0;
    ship.angle += d * Math.PI / 180;
    return `Rotated by ${deg}°`;
};

window.stopShip = function() {
    if (!ship) return "No ship.";
    ship.vx = 0;
    ship.vy = 0;
    ship.thrustPower = 0;
    return "Ship stopped.";
};

window.despawnShip = function() {
    ship = null;
    return "Spaceship removed.";
};

// ENEMY API
let enemySpawnInterval = null;

window.spawnenemies = function() {
    if (enemySpawnInterval) return "Enemies already spawning.";
    for (let i = 0; i < 3; i++) spawnEnemy();
    enemySpawnInterval = setInterval(() => {
        if (enemies.length < 20) spawnEnemy();
    }, 3000);
    return "✓ Enemy spawning started.";
};

window.stopspawningenemies = function() {
    if (enemySpawnInterval) {
        clearInterval(enemySpawnInterval);
        enemySpawnInterval = null;
    }
    return "Enemy spawning stopped.";
};

// SHOOT API
window.shoot = function() {
    if (!ship) return "No ship.";
    const speed = 420;

    // zbraně – posunuty dál ke konci křídla
    const guns = [
        { x: ship.size * 0.50, y: -ship.size * 0.16 },
        { x: ship.size * 0.50, y:  ship.size * 0.16 }
    ];

    for (const g of guns) {
        const cosA = Math.cos(ship.angle);
        const sinA = Math.sin(ship.angle);
        const bx = ship.x + cosA * g.x - sinA * g.y;
        const by = ship.y + sinA * g.x + cosA * g.y;
        const vx = Math.cos(ship.angle) * speed;
        const vy = Math.sin(ship.angle) * speed;
        bullets.push(new Bullet(bx, by, vx, vy));
    }
    return "Pew!";
};
