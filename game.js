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
  { name: "Fists", bonus: 0, cost: 0 },
  { name: "Gloves", bonus: 2, cost: 50 },
  { name: "Sword", bonus: 5, cost: 150 },
  { name: "Great Axe", bonus: 10, cost: 400 },
  { name: "Dragon Blade", bonus: 25, cost: 1500 }
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
  prestiges: 0
};

/* =========================
   MONSTER
========================= */
let monsterMaxHp = 50;
let monsterHp = monsterMaxHp;

/* =========================
   UI ELEMENTS
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
   MONSTER NAME
========================= */
function getMonsterName() {
  const names = ["Goblin", "Slime", "Skeleton", "Orc", "Wolf"];
  let base = names[Math.floor(Math.random() * names.length)];

  return bossWave ? "😈 Demon " + base : base;
}

/* =========================
   DAMAGE
========================= */
function getDamage() {
  let dmg = power + weapon.bonus + skills.strength;

  let critRoll = critChance + skills.crit * 0.02;

  if (Math.random() < critRoll) {
    stats.crits++;
    showToast("💥 CRIT!");
    return Math.floor(dmg * critMultiplier);
  }

  return Math.floor(dmg);
}

function damageMonster(dmg) {
  monsterHp -= dmg;
  stats.totalDamage += dmg;

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

  nextWave();
}

/* =========================
   NEXT WAVE
========================= */
function nextWave() {
  wave++;

  bossWave = wave % 5 === 0;

  monsterMaxHp = bossWave
    ? 300 + wave * 35
    : 50 + wave * 20;

  monsterHp = monsterMaxHp;

  monsterNameText.textContent = getMonsterName();

  if (wave % 3 === 0) {
    skillPoints++;
    showToast("🌳 Skill Point +1");
  }

  updateUI();
}

/* =========================
   TRAIN
========================= */
trainBtn.onclick = () => {
  damageMonster(getDamage());
};

/* =========================
   UPGRADES
========================= */
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

/* =========================
   AUTO DAMAGE
========================= */
setInterval(() => {
  if (speed > 0) {
    damageMonster(speed);
  }
}, 1000);

/* =========================
   SKILL TREE
========================= */
function upgradeSkill(type) {
  if (skillPoints <= 0) {
    showToast("No skill points!");
    return;
  }

  skillPoints--;

  if (type === "strength") skills.strength++;
  if (type === "crit") skills.crit++;
  if (type === "income") skills.income++;

  showToast("⬆️ Skill upgraded!");
}

window.upgradeSkill = upgradeSkill;

/* =========================
   ACHIEVEMENTS (FIXED)
========================= */
achBtn.onclick = () => {
  let html = `<h3>🏆 Achievements</h3>`;

  const list = [
    { name: "First Blood", check: stats.monstersKilled >= 1 },
    { name: "Hunter (10 Kills)", check: stats.monstersKilled >= 10 },
    { name: "Wave 10", check: wave >= 10 },
    { name: "Crit Master", check: stats.crits >= 5 }
  ];

  list.forEach(a => {
    html += `<p>${a.check ? "✅" : "⬜"} ${a.name}</p>`;
  });

  panel.innerHTML = html;
};

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

skillBtn.onclick = () => {
  panel.innerHTML = `
    <h3>🌳 Skill Tree</h3>

    <p>Skill Points: ${skillPoints}</p>

    <p>Strength: ${skills.strength}</p>
    <button onclick="upgradeSkill('strength')">Upgrade</button>

    <p>Crit: ${skills.crit}</p>
    <button onclick="upgradeSkill('crit')">Upgrade</button>

    <p>Income: ${skills.income}</p>
    <button onclick="upgradeSkill('income')">Upgrade</button>
  `;
};

invBtn.onclick = () => {
  panel.innerHTML = `
    <h3>🎒 Inventory</h3>
    <p>${weapon.name}</p>
  `;
};

/* =========================
   UI UPDATE
========================= */
function updateUI() {
  powerText.textContent = `Power: ${power} (${weapon.name})`;
  coinsText.textContent = `Coins: ${coins}`;

  roundText.textContent = bossWave
    ? `😈 Boss Wave ${wave}`
    : `Wave ${wave}`;

  monsterHpText.textContent =
    `${Math.max(0, monsterHp)} / ${monsterMaxHp}`;

  monsterBar.style.width =
    (monsterHp / monsterMaxHp) * 100 + "%";

  upgradeBtn.textContent = `💪 Upgrade Power (${powerCost})`;
  autoBtn.textContent = `⚡ Upgrade Speed (${speedCost})`;
}

/* =========================
   START
========================= */
monsterNameText.textContent = getMonsterName();
updateUI();
