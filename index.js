const game = document.getElementById("game");
const BACKGROUND = "#101010";
const FOREGROUND = "#50FF50";

game.width = 800;
game.height = 800;
const ctx = game.getContext("2d");

// Parameters
let projectionMode = "PERSPECTIVE"; // 'PERSPECTIVE', 'PARALLEL', or 'OBLIQUE'
let dz = 1.5;
let l_dir = 0.5;
let m_dir = 0.5;
let rotSpeed = 1.0;
let isPaused = false;
let angle = 0;

// UI Elements
const btnMode = document.getElementById("btnMode");
const sliderZ = document.getElementById("sliderZ");
const valZ = document.getElementById("valZ");
const obliqueControls = document.getElementById("obliqueControls");
const sliderL = document.getElementById("sliderL");
const valL = document.getElementById("valL");
const sliderM = document.getElementById("sliderM");
const valM = document.getElementById("valM");
const sliderSpeed = document.getElementById("sliderSpeed");
const valSpeed = document.getElementById("valSpeed");
const btnPause = document.getElementById("btnPause");

// Event Listeners for Controls
btnMode.addEventListener("click", () => {
    if (projectionMode === "PERSPECTIVE") {
        projectionMode = "PARALLEL";
    } else if (projectionMode === "PARALLEL") {
        projectionMode = "OBLIQUE";
    } else {
        projectionMode = "PERSPECTIVE";
    }
    btnMode.innerText = `Mode: ${projectionMode}`;
    obliqueControls.style.display = projectionMode === "OBLIQUE" ? "flex" : "none";
});

sliderZ.addEventListener("input", (e) => {
    dz = parseFloat(e.target.value);
    valZ.innerText = dz.toFixed(1);
});

sliderL.addEventListener("input", (e) => {
    l_dir = parseFloat(e.target.value);
    valL.innerText = l_dir.toFixed(2);
});

sliderM.addEventListener("input", (e) => {
    m_dir = parseFloat(e.target.value);
    valM.innerText = m_dir.toFixed(2);
});

sliderSpeed.addEventListener("input", (e) => {
    rotSpeed = parseFloat(e.target.value);
    valSpeed.innerText = rotSpeed.toFixed(1);
});

btnPause.addEventListener("click", () => {
    isPaused = !isPaused;
});

function clear() {
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, game.width, game.height);
}

function line(p1, p2) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = FOREGROUND;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function screen(p) {
    // -1..1 => 0..2 => 0..1 => 0..w
    return {
        x: (p.x + 1) / 2 * game.width,
        y: (1 - (p.y + 1) / 2) * game.height,
    };
}

/**
 * Enhanced Projection Function supporting Perspective, 
 * Orthographic Parallel, and Oblique Parallel Projections
 */
function project({x, y, z}, mode) {
    if (mode === "PARALLEL") {
        // Pure Orthographic Parallel Projection
        return { x: x, y: y };
    } else if (mode === "OBLIQUE") {
        // Oblique Projection along direction vector (l, m, n=1)
        return {
            x: x - l_dir * z,
            y: y - m_dir * z
        };
    } else if (mode === "ARBITRARY_PLANE") {
        // --- STEP 1: Translate origin to (x0, y0, z0) ---
        const dx = x - x0;
        const dy = y - y0;
        const dz = z - z0;

        // --- STEP 2: Rotate to align normal vector (l, m, n) to Z-axis (0, 0, 1) ---
        // Normalize normal vector
        const len = Math.hypot(l_dir, m_dir, n_dir) || 1;
        const nx = l_dir / len;
        const ny = m_dir / len;
        const nz = n_dir / len;

        // Spherical alignment angles
        const cosTheta = nz;
        const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
        
        let uX = 0, uY = 0;
        if (sinTheta > 0.001) {
            uX = -ny / sinTheta;
            uY = nx / sinTheta;
        }

        // Project transformed 3D point onto aligned plane coordinates (x', y')
        const x_proj = dx * (uX * uX * (1 - cosTheta) + cosTheta) + dy * (uX * uY * (1 - cosTheta)) + dz * (uY * sinTheta);
        const y_proj = dx * (uX * uY * (1 - cosTheta)) + dy * (uY * uY * (1 - cosTheta) + cosTheta) - dz * (uX * sinTheta);

        return { x: x_proj, y: y_proj };
    }else {
        // Standard Perspective Projection (x' = x/z, y' = y/z)
        const safeZ = z <= 0.001 ? 0.001 : z;
        return {
            x: x / safeZ,
            y: y / safeZ,
        };
    }
}

function translate_z({x, y, z}, dz) {
    return { x, y, z: z + dz };
}

function rotate_xz({x, y, z}, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
        x: x * c - z * s,
        y,
        z: x * s + z * c,
    };
}

// const vs = [
//     {x:  0.25, y:  0.25, z:  0.25},
//     {x: -0.25, y:  0.25, z:  0.25},
//     {x: -0.25, y: -0.25, z:  0.25},
//     {x:  0.25, y: -0.25, z:  0.25},

//     {x:  0.25, y:  0.25, z: -0.25},
//     {x: -0.25, y:  0.25, z: -0.25},
//     {x: -0.25, y: -0.25, z: -0.25},
//     {x:  0.25, y: -0.25, z: -0.25},
// ];

// const fs = [
//     [0, 1, 2, 3],
//     [4, 5, 6, 7],
//     [0, 4],
//     [1, 5],
//     [2, 6],
//     [3, 7],
// ];

const FPS = 60;

function frame() {
    const dt = 1 / FPS;
    if (!isPaused) {
        angle += Math.PI * dt * rotSpeed;
    }
    
    clear();

    for (const f of fs) {
        for (let i = 0; i < f.length; ++i) {
            const a = vs[f[i]];
            const b = vs[f[(i + 1) % f.length]];

            const pA = screen(project(translate_z(rotate_xz(a, angle), dz), projectionMode));
            const pB = screen(project(translate_z(rotate_xz(b, angle), dz), projectionMode));

            line(pA, pB);
        }
    }

    setTimeout(frame, 1000 / FPS);
}

setTimeout(frame, 1000 / FPS);