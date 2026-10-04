const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const CHARS = {
    isagi:   { name: 'ایساگی', emoji: '⚽', team: 'BL', weapon: 'Metavision', power: 70, speed: 75, tech: 78, vision: 95, bonus: 0.15, quote: 'من بهترین مهاجم جهان می‌شم!' },
    bachira: { name: 'باچیرا', emoji: '🎩', team: 'BL', weapon: 'Instinct Dribble', power: 72, speed: 82, tech: 88, vision: 75, bonus: 0.14, quote: 'هیولا توی من بیدار شده!' },
    chigiri: { name: 'چیگیری', emoji: '⚡', team: 'BL', weapon: 'Speed Burst', power: 68, speed: 99, tech: 80, vision: 70, bonus: 0.13, quote: 'من دیگه نمی‌ترسم!' },
    nagi:    { name: 'ناگی', emoji: '🕹️', team: 'BL', weapon: 'Ball Control', power: 75, speed: 72, tech: 95, vision: 80, bonus: 0.16, quote: 'خیلی دردسره...' },
    rin:     { name: 'رین', emoji: '🧊', team: 'NE', weapon: 'Puppet Control', power: 82, speed: 85, tech: 90, vision: 88, bonus: 0.20, quote: 'من برادرم رو نابود می‌کنم!' },
    shidou:  { name: 'شیدو', emoji: '👊', team: 'NE', weapon: 'Wild Shot', power: 90, speed: 88, tech: 85, vision: 65, bonus: 0.19, quote: 'فوتبال یعنی زندگی!' },
    reo:     { name: 'رئو', emoji: '🦎', team: 'NE', weapon: 'Chameleon Copy', power: 78, speed: 80, tech: 82, vision: 85, bonus: 0.15, quote: 'من همه چیز رو کپی می‌کنم!' },
    sae:     { name: 'سائه', emoji: '🌟', team: 'NE', weapon: 'World Class Pass', power: 75, speed: 78, tech: 92, vision: 99, bonus: 0.22, quote: 'فوتبال ژاپن مرده!' },
};

let myChar = null;

const user = tg.initDataUnsafe?.user;
if (user) {
    document.getElementById('user-name').textContent = `خوش اومدی، ${user.first_name}!`;
}

const grid = document.getElementById('chars-grid');
for (const [key, c] of Object.entries(CHARS)) {
    const card = document.createElement('div');
    card.className = 'char-card';
    card.innerHTML = `<span class="emoji">${c.emoji}</span><span class="name">${c.name}</span>`;
    card.onclick = () => selectChar(key);
    grid.appendChild(card);
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function selectChar(key) {
    myChar = key;
    tg.HapticFeedback?.impactOccurred('medium');
    showScreen('menu');
}

function showCard() {
    const c = CHARS[myChar];
    const text = `${c.emoji} ${c.name}\n━━━━━━━━━━━━━━\nتیم: ${c.team === 'BL' ? '🔵 Blue Lock XI' : '🔴 Neo Egoist'}\nسلاح: ${c.weapon}\n━━━━━━━━━━━━━━\n📊 قدرت: ${c.power}\n⚡ سرعت: ${c.speed}\n🎯 تکنیک: ${c.tech}\n👁️ دید: ${c.vision}\n🔥 بونوس: +${Math.round(c.bonus * 100)}%\n━━━━━━━━━━━━━━\n💬 "${c.quote}"`;
    document.getElementById('result-text').textContent = text;
    showScreen('result');
}

function backToMenu() { showScreen('menu'); }
function changeChar() { showScreen('char-select'); }

function simulate(enemyKey) {
    const me = CHARS[myChar];
    const en = CHARS[enemyKey];
    const myP = me.bonus + (me.power + me.tech + me.vision) / 500;
    const enP = en.bonus + (en.power + en.tech + en.vision) / 500;
    const win = Math.random() < (myP / (myP + enP));
    const myG = win ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 3);
    const enG = win ? Math.floor(Math.random() * myG) : myG + Math.floor(Math.random() * 3) + 1;
    let text = `⚔️ مسابقه ۱v۱\n\n${me.emoji} ${me.name}  vs  ${en.emoji} ${en.name}\n\n`;
    text += `⏱️ دقیقه ${Math.floor(Math.random()*20)+5}: ${me.name} حمله می‌کنه...\n`;
    text += `⏱️ دقیقه ${Math.floor(Math.random()*20)+25}: ${en.name} شوت می‌زنه...\n`;
    text += `⏱️ دقیقه ${Math.floor(Math.random()*20)+50}: ${me.name} دریبل می‌زنه...\n`;
    text += `⏱️ دقیقه ${Math.floor(Math.random()*15)+75}: ${en.name} ضدحمله...\n\n`;
    text += `🎯 نتیجه نهایی:\n${me.emoji} ${me.name}  ${myG} - ${enG}  ${en.emoji} ${en.name}\n\n`;
    text += win ? `🎉 بردی!\n💬 "${me.quote}"` : `😔 باختی...\n💬 "${en.quote}"`;
    return text;
}

function play1v1() {
    const enemies = Object.keys(CHARS).filter(k => CHARS[k].team !== CHARS[myChar].team);
    const enemy = enemies[Math.floor(Math.random() * enemies.length)];
    document.getElementById('result-text').textContent = simulate(enemy);
    showScreen('result');
}

function play2v2() {
    const myTeam = CHARS[myChar].team;
    const allies = Object.keys(CHARS).filter(k => CHARS[k].team === myTeam && k !== myChar);
    const enemies = Object.keys(CHARS).filter(k => CHARS[k].team !== myTeam);
    const ally = allies[Math.floor(Math.random() * allies.length)];
    const shuffled = enemies.sort(() => 0.5 - Math.random());
    const e1 = shuffled[0], e2 = shuffled[1];
    const me = CHARS[myChar], al = CHARS[ally], en1 = CHARS[e1], en2 = CHARS[e2];
    let myP = me.bonus + al.bonus + (me.power + al.power + me.tech + al.tech) / 500;
    let enP = en1.bonus + en2.bonus + (en1.power + en2.power + en1.tech + en2.tech) / 500;
    if (myChar === 'sae' || ally === 'sae') myP *= 1.1;
    if (e1 === 'sae' || e2 === 'sae') enP *= 1.1;
    const win = Math.random() < (myP / (myP + enP));
    const myG = win ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 3);
    const enG = win ? Math.floor(Math.random() * myG) : myG + Math.floor(Math.random() * 4) + 1;
    let text = `⚽ مسابقه ۲v۲\n\n🟦 ${me.emoji} ${me.name} + ${al.emoji} ${al.name}\n   vs\n🟥 ${en1.emoji} ${en1.name} + ${en2.emoji} ${en2.name}\n\n`;
    text += `⏱️ دقیقه ${Math.floor(Math.random()*20)+10}: ${me.name} پاس می‌ده به ${al.name}...\n`;
    text += `⏱️ دقیقه ${Math.floor(Math.random()*20)+40}: ${en1.name} حمله می‌کنه...\n`;
    text += `⏱️ دقیقه ${Math.floor(Math.random()*15)+70}: ${en2.name} شوت می‌زنه...\n\n`;
    text += `🎯 نتیجه:\n🟦 تیم تو: ${myG}\n🟥 تیم حریف: ${enG}\n\n`;
    text += win ? `🎉 تیمت برد!\n💬 "${me.quote}"` : `😔 تیمت باخت...\n💬 "${en1.quote}"`;
    document.getElementById('result-text').textContent = text;
    showScreen('result');
}
