/* =========================
   PLAYER
========================= */
let power = 1;
let coins = 0;
let speed = 0;

let powerCost = 10;
let speedCost = 50;

let critChance = 0.10;
let critMultiplier = 2;

let wave = 1;
let bossWave = false;

let skillPoints = 0;

/* =========================
   WEAPONS
========================= */
const weapons = [
  { name: "Fists", bonus: 0, cost: 0, rarity: "Common" },
  { name: "Gloves", bonus: 2, cost: 50, rarity: "Common" },
  { name: "Sword", bonus: 5, cost: 150, rarity: "Rare" },
  { name: "Great Axe", bonus: 10, cost: 400, rarity: "Epic" },
  { name: "Dragon Blade", bonus: 25, cost: 1500, rarity: "Legendary" }
];

let weapon = weapons[0];

/* =========================
   SKILLS
========================= */
const skills = {
  strength: 0,
  crit: 0,
  income: 0
};

/* =========================
   STATS
========================= */
const stats = {
  totalDamage: 0,
  monstersKilled: 0,
  crits: 0,
  prestiges: 0,
  achievements: []
};

/* =========================
   MONSTER
========================= */
let monsterMaxHp = 50;
let monsterHp = monsterMaxHp;

/* =========================
   ACHIEVEMENTS
========================= */
const achievements = [
  { id: "first_kill", name: "First Blood", done: false },
  { id: "ten_kills", name: "Hunter", done: false },
  { id: "wave_10", name: "Survivor", done: false },
  { id: "first_crit", name: "Lucky Hit", done: false }
];

/* =========================
   UI
========================= */
const powerText = document.getElementById("power");
const coinsText = document.getElementById("coins");
const roundText = document.getElementById("round");

const monsterBar = document.getElementById("monsterBar");
const monsterHpText = document.getElementById("monsterHp");
const monsterNameText = document.getElementById("monsterName");

const trainBtn = document.getElementById("trainBtn");
const upgradeBtn = document.getElementById("upgradeBtn");
const autoBtn = document.getElementById("autoBtn");

const statsBtn = document.getElementById("statsBtn");
const invBtn = document.getElementById("invBtn");
const skillBtn = document.getElementById("skillBtn");
const achBtn = document.getElementById("achBtn");

const panel = document.getElementById("panel");
const toast = document.getElementById("toast");

/* =========================
   TOAST SYSTEM
========================= */
function showToast(msg) {
  const div = document.createElement("div");
  div.className = "toast-msg";
  div.textContent = msg;
  toast.appendChild(div);

  setTimeout(() => div.remove(), 2000);
}

/* =========================
   MONSTER NAMES
========================= */
function getMonsterName() {
  const names = ["Goblin", "Slime", "Skeleton", "Orc", "Wolf"];
  let base = names[Math.floor(Math.random() * names.length)];

  return bossWave ? "😈 Demon Lord " + base : base;
}

/* =========================
   DAMAGE
========================= */
function getDamage() {
  let dmg = power + weapon.bonus + skills.strength;

  let critRoll = critChance + skills.crit * 0.02;

  if (Math.random() < critRoll) {
    stats.crits++;

    if (!achievements.find(a => a.id === "first_crit").done) {
      unlockAchievement("first_crit");
    }

    return Math.floor(dmg * critMultiplier);
  }

  return Math.floor(dmg);
}

function damageMonster(dmg) {
  monsterHp -= dmg;
  stats.totalDamage += dmg;

  if (stats.monstersKilled === 0 && monsterHp <= 0) {
    unlockAchievement("first_kill");
  }

  showToast("-" + dmg);

  if (monsterHp <= 0) killMonster();

  updateUI();
}

/* =========================
   MONSTER DEATH
========================= */
function killMonster() {
  stats.monstersKilled++;

  let reward = bossWave ? 120 + wave * 10 : 10 + wave * 2;
  reward += skills.income * 5;

  coins += reward;

  if (stats.monstersKilled === 10) unlockAchievement("ten_kills");

  tryLoot();

  nextWave();
}

/* =========================
   LOOT SYSTEM
========================= */
function tryLoot() {
  let chance = bossWave ? 0.6 : 0.2;

  if (Math.random() < chance) {
    let loot = weapons[Math.floor(Math.random() * weapons.length)];
    weapon = loot;

    showToast("🎁 Loot: " + loot.name);
  }
}

/* =========================
   WAVE SYSTEM
========================= */
function nextWave() {
  wave++;

  bossWave = wave % 5 === 0;

  if (wave === 10) unlockAchievement("wave_10");

  monsterMaxHp = bossWave
    ? 300 + wave * 35
    : 50 + wave * 20;

  monsterHp = monsterMaxHp;

  monsterNameText.textContent = getMonsterName();

  updateUI();
}

/* =========================
   ACHIEVEMENTS
========================= */
function unlockAchievement(id) {
  let ach = achievements.find(a => a.id === id);

  if (ach && !ach.done) {
    ach.done = true;

    showToast("🏆 Achievement: " + ach.name);
  }
}

/* =========================
   BUTTONS
========================= */
trainBtn.onclick = () => damageMonster(getDamage());

upgradeBtn.onclick = () => {
  if (coins >= powerCost) {
    coins -= powerCost;
    power++;
    powerCost = Math.floor(powerCost * 1.35);
    updateUI();
  }
};

autoBtn.onclick = () => {
  if (coins >= speedCost) {
    coins -= speedCost;
    speed++;
    speedCost = Math.floor(speedCost * 1.5);
    updateUI();
  }
};

setInterval(() => {
  if (speed > 0) damageMonster(speed);
}, 1000);

/* =========================
   MENUS
========================= */
statsBtn.onclick = () => {
  panel.innerHTML = `
    <h3>📊 Stats</h3>
    <p>Kills: ${stats.monstersKilled}</p>
    <p>Damage: ${stats.totalDamage}</p>
    <p>Crits: ${stats.crits}</p>
  `;
};

invBtn.onclick = () => {
  let html = `<h3>🎒 Inventory</h3><p>${weapon.name}</p>`;

  weapons.forEach((w, i) => {
    html += `<button onclick="buyWeapon(${i})">${w.name}</button>`;
  });

  panel.innerHTML = html;
};

skillBtn.onclick = () => {
  panel.innerHTML = `
    <h3>🌳 Skill Tree</h3>
    <p>Strength: ${skills.strength}</p>
    <p>Crit: ${skills.crit}</p>
    <p>Income: ${skills.income}</p>
  `;
};

achBtn.onclick = () => {
  let html = `<h3>🏆 Achievements</h3>`;

  achievements.forEach(a => {
    html += `<p>${a.done ? "✅" : "⬜"} ${a.name}</p>`;
  });

  panel.innerHTML = html;
};

/* =========================
   WEAPONS
========================= */
function buyWeapon(i) {
  let w = weapons[i];

  if (coins >= w.cost) {
    coins -= w.cost;
    weapon = w;
    updateUI();
  }
}
window.buyWeapon = buyWeapon;

/* =========================
   UI UPDATE
========================= */
function updateUI() {
  powerText.textContent = `Power: ${power} (${weapon.name})`;
  coinsText.textContent = `Coins: ${coins}`;

  roundText.textContent = bossWave
    ? `😈 BOSS Wave ${wave}`
    : `Wave ${wave}`;

  monsterHpText.textContent =
    `${Math.max(0, monsterHp)} / ${monsterMaxHp}`;

  monsterBar.style.width =
    (monsterHp / monsterMaxHp) * 100 + "%";
}

/* =========================
   START
========================= */
monsterNameText.textContent = getMonsterName();
updateUI();
