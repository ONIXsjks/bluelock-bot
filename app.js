const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let myScore = 0;
let enemyScore = 0;
let gameTime = 0;
let gameInterval = null;
let isGameActive = false;

// موقعیت‌ها (درصد)
let myPos = { x: 50, y: 85 };
let ballPos = { x: 50, y: 70 };
let enemyPos = { x: 50, y: 30 };

const myPlayerEl = document.getElementById('my-player');
const enemyPlayerEl = document.getElementById('enemy-player');
const ballEl = document.getElementById('ball');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');

// شروع بازی
function startGame() {
    isGameActive = true;
    gameTime = 0;
    myScore = 0;
    enemyScore = 0;
    updateScore();
    updateTimer();
    
    myPos = { x: 50, y: 85 };
    ballPos = { x: 50, y: 70 };
    enemyPos = { x: 50, y: 30 };
    
    render();
    startEnemyAI();
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        if (!isGameActive) return;
        gameTime++;
        updateTimer();
        if (gameTime >= 90) endGame();
    }, 1000);
}

function updateScore() {
    scoreEl.textContent = `${myScore} - ${enemyScore}`;
}

function updateTimer() {
    const min = String(Math.floor(gameTime)).padStart(2, '0');
    timerEl.textContent = `${min}:00`;
}

function render() {
    myPlayerEl.style.left = myPos.x + '%';
    myPlayerEl.style.top = myPos.y + '%';
    
    enemyPlayerEl.style.left = enemyPos.x + '%';
    enemyPlayerEl.style.top = enemyPos.y + '%';
    
    ballEl.style.left = ballPos.x + '%';
    ballEl.style.top = ballPos.y + '%';
    
    // توپ با بازیکن حرکت می‌کنه اگه نزدیک باشه
    const dist = Math.hypot(myPos.x - ballPos.x, myPos.y - ballPos.y);
    if (dist < 15) {
        ballPos.x = myPos.x;
        ballPos.y = myPos.y - 8;
    }
}

function move(direction) {
    if (!isGameActive) return;
    tg.HapticFeedback?.impactOccurred('light');
    
    const step = 6;
    
    if (direction === 'up' && myPos.y > 20) myPos.y -= step;
    if (direction === 'down' && myPos.y < 92) myPos.y += step;
    if (direction === 'left' && myPos.x > 10) myPos.x -= step;
    if (direction === 'right' && myPos.x < 90) myPos.x += step;
    
    render();
    checkGoal();
}

function shoot() {
    if (!isGameActive) return;
    tg.HapticFeedback?.impactOccurred('medium');
    
    // چک کن نزدیک دروازه حریف هستی
    if (myPos.y > 30) {
        tg.showAlert('هنوز به دروازه نرسیدی! ⬆️ جلو برو');
        return;
    }
    
    // انیمیشن شوت
    myPlayerEl.classList.add('shooting');
    setTimeout(() => myPlayerEl.classList.remove('shooting'), 300);
    
    // توپ پرواز می‌کنه سمت دروازه
    ballPos.x = 45 + Math.random() * 10;
    ballPos.y = 10;
    ballEl.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    render();
    
    setTimeout(() => {
        // شانس گل
        const chance = 0.6;
        if (Math.random() < chance) {
            myScore++;
            updateScore();
            showGoal('🎉 GOAL! 🎉');
        } else {
            tg.showAlert('دروازه‌بان گرفت! 🧤');
        }
        
        // ریست
        setTimeout(resetAfterShoot, 800);
    }, 700);
}

function dribble() {
    if (!isGameActive) return;
    tg.HapticFeedback?.impactOccurred('light');
    
    // حرکت سریع به جلو
    myPos.y -= 12;
    if (myPos.y < 20) myPos.y = 20;
    ballPos.x = myPos.x;
    ballPos.y = myPos.y - 8;
    render();
    checkGoal();
}

function checkGoal() {
    // گل زدن به حریف
    if (ballPos.y < 8 && Math.abs(ballPos.x - 50) < 20) {
        myScore++;
        updateScore();
        showGoal('🎉 GOAL! 🎉');
        setTimeout(resetPositions, 1000);
    }
}

function resetAfterShoot() {
    ballPos.x = 50;
    ballPos.y = 50;
    myPos.x = 50;
    myPos.y = 85;
    ballEl.style.transition = 'all 0.5s ease';
    render();
}

function resetPositions() {
    myPos = { x: 50, y: 85 };
    ballPos = { x: 50, y: 70 };
    enemyPos = { x: 50, y: 30 };
    render();
}

function showGoal(text) {
    const goalEl = document.createElement('div');
    goalEl.className = 'goal-text';
    goalEl.textContent = text;
    document.getElementById('game-container').appendChild(goalEl);
    setTimeout(() => goalEl.remove(), 1500);
}

// AI حریف
function startEnemyAI() {
    setInterval(() => {
        if (!isGameActive) return;
        
        // حریف به سمت توپ می‌ره
        const dx = ballPos.x - enemyPos.x;
        const dy = ballPos.y - enemyPos.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 3) {
            enemyPos.x += (dx / dist) * 2;
            enemyPos.y += (dy / dist) * 2;
        }
        
        // اگه توپ رو گرفت، به سمت دروازه من شوت می‌کنه
        if (dist < 8 && Math.random() < 0.3) {
            enemyScore++;
            updateScore();
            showGoal('😔 گل حریف...');
            setTimeout(resetPositions, 1000);
        }
        
        render();
    }, 500);
}

function endGame() {
    isGameActive = false;
    if (gameInterval) clearInterval(gameInterval);
    
    let msg = '';
    if (myScore > enemyScore) msg = '🎉 بردی!';
    else if (myScore < enemyScore) msg = '😔 باختی...';
    else msg = '🤝 مساوی!';
    
    tg.showAlert(`پایان بازی!\n${myScore} - ${enemyScore}\n${msg}`, () => {
        startGame();
    });
}

// شروع خودکار
startGame();
