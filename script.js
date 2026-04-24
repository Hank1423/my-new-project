const CONFIG = {
    frameW: 240,
    frameH: 240,
    // Tên file phải chính xác với tên file bạn lưu trong thư mục
    idleImg: 'idle_spritesheet.png', 
    walkImg: 'walk_spritesheet.png',
    idleCount: 2,   // Số frame trong file idle
    walkCount: 8,   // Số frame trong file walk
    fps: 12,
    speed: 3
};

// --- CHỐNG NHÁY: Tải sẵn ảnh vào bộ nhớ ---
const cache = {
    idle: new Image(),
    walk: new Image()
};
cache.idle.src = CONFIG.idleImg;
cache.walk.src = CONFIG.walkImg;

const playerEl = document.getElementById('player');
const spriteEl = document.getElementById('sprite');
const knob = document.getElementById('joystick-knob');
const container = document.getElementById('joystick-container');

let state = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: 0, vy: 0,
    frame: 0,
    flip: 1,
    isMoving: false,
    lastTime: 0,
    currentAction: '' // Theo dõi trạng thái để tránh đổi ảnh liên tục
};

// Xử lý Joystick (Giữ nguyên logic của bạn)
function handleInput(e) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.min(Math.sqrt(dx*dx + dy*dy), 40);
    const angle = Math.atan2(dy, dx);

    state.vx = (Math.cos(angle) * dist) / 40;
    state.vy = (Math.sin(angle) * dist) / 40;
    state.isMoving = dist > 5;

    knob.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`;
    if (state.vx !== 0) state.flip = state.vx > 0 ? 1 : -1;
}

function stopInput() {
    state.vx = 0; state.vy = 0;
    state.isMoving = false;
    knob.style.transform = `translate(0,0)`;
}

container.addEventListener('touchstart', e => e.preventDefault());
window.addEventListener('touchmove', handleInput);
window.addEventListener('touchend', stopInput);
container.addEventListener('mousedown', () => window.addEventListener('mousemove', handleInput));
window.addEventListener('mouseup', () => {
    window.removeEventListener('mousemove', handleInput);
    stopInput();
});

// Vòng lặp Game
function update(time) {
    // 1. Di chuyển
    state.x += state.vx * CONFIG.speed;
    state.y += state.vy * CONFIG.speed;

    // Giới hạn biên (Trừ đi nửa kích thước nhân vật để không bị lòi ra ngoài)
    state.x = Math.max(CONFIG.frameW / 2, Math.min(window.innerWidth - CONFIG.frameW / 2, state.x));
    state.y = Math.max(CONFIG.frameH / 2, Math.min(window.innerHeight - CONFIG.frameH / 2, state.y));

    // 2. KIỂM TRA ĐỔI FILE ẢNH (Chỉ đổi khi trạng thái thay đổi)
    let action = state.isMoving ? 'walk' : 'idle';
    if (state.currentAction !== action) {
        state.currentAction = action;
        state.frame = 0; // Reset frame về 0 khi đổi file
        spriteEl.style.backgroundImage = `url(${action === 'walk' ? CONFIG.walkImg : CONFIG.idleImg})`;
    }

    // 3. Chuyển đổi Frame Animation (Dựa trên số lượng ảnh của từng file riêng)
    if (time - state.lastTime > 1000 / CONFIG.fps) {
        state.lastTime = time;
        let maxFrames = state.isMoving ? CONFIG.walkCount : CONFIG.idleCount;
        state.frame = (state.frame + 1) % maxFrames;
    }

    // 4. Render
    const posX = -(state.frame * CONFIG.frameW);
    
    // Sử dụng translate để di chuyển tâm và scaleX để quay mặt
    // Chú ý: -CONFIG.frameW/2 giúp nhân vật nằm đúng tâm vị trí state.x, state.y
    playerEl.style.transform = `translate(${state.x - CONFIG.frameW/2}px, ${state.y - CONFIG.frameH/2}px) scaleX(${state.flip})`;
    spriteEl.style.backgroundPosition = `${posX}px 0px`;

    requestAnimationFrame(update);
}

requestAnimationFrame(update);