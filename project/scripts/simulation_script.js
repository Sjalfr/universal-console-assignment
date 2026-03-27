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

// ====================== SPACESHIP ======================
class Spaceship {
    constructor() { this.reset(); }
    reset() {
        this.x = 0; this.y = 0;
        this.vx = 0; this.vy = 0;
        this.angle = 0;
        this.thrustPower = 0;
        this.size = 18;
    }
    update(dt) {
        const ax = Math.cos(this.angle) * this.thrustPower * 180;
        const ay = Math.sin(this.angle) * this.thrustPower * 180;
        this.vx += ax * dt;
        this.vy += ay * dt;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.thrustPower *= 0.92;
    }
    draw() {
        const pos = worldToScreen(this.x, this.y);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = '#00ddff';
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(-this.size * 0.8, -this.size * 0.7);
        ctx.lineTo(-this.size * 0.55, 0);
        ctx.lineTo(-this.size * 0.8, this.size * 0.7);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#112244';
        ctx.beginPath();
        ctx.arc(this.size * 0.25, 0, this.size * 0.28, 0, Math.PI * 2);
        ctx.fill();

        if (this.thrustPower > 0.08) {
            ctx.fillStyle = `rgba(255,140,0,${this.thrustPower})`;
            const len = this.size * (0.9 + Math.random() * 0.7);
            ctx.beginPath();
            ctx.moveTo(-this.size * 0.55, 0);
            ctx.lineTo(-len, -this.size * 0.4);
            ctx.lineTo(-len * 0.7, 0);
            ctx.lineTo(-len, this.size * 0.4);
            ctx.fill();
        }
        ctx.restore();
    }
}

let ship = null;

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

// DŮLEŽITÉ: Správný resize, který opraví malé pole
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reset pozic hvězd při velké změně velikosti (aby se nevytvářely mimo obrazovku)
    closeStars.forEach(s => s.reset());
    midStars.forEach(s => s.reset());
    farStars.forEach(s => s.reset());
    galaxies.forEach(g => g.reset());
    dusts.forEach(d => d.reset());
    foreground.forEach(f => f.reset());
}
window.addEventListener('resize', resize);
resize();   // první volání

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

        if (ship) ship.update(dt);
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

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

// ====================== TERMINAL API ======================
window.spawnShip = function() {
    if (!ship) ship = new Spaceship();
    else ship.reset();
    return "✓ Spaceship created at (0, 0). Use console commands to control it.";
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
    ship.vx *= (1 - Math.max(0, Math.min(1, v)) * 0.7);
    ship.vy *= (1 - Math.max(0, Math.min(1, v)) * 0.7);
    return `Brake applied.`;
};

window.setRotate = function(deg) {
    if (!ship) return "No ship.";
    ship.angle = (parseFloat(deg) || 0) * Math.PI / 180;
    return `Rotated to ${deg}°`;
};

window.stopShip = function() {
    if (!ship) return "No ship.";
    ship.vx = ship.vy = ship.thrustPower = 0;
    return "Ship stopped.";
};

window.despawnShip = function() {
    ship = null;
    return "Spaceship removed.";
};