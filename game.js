alert("JS LOADED");

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
  lootDrops: 0
};

/* =========================
   MONSTER
========================= */
let monsterMaxHp = 50;
let monsterHp = monsterMaxHp;

/* =========================
   UI
========================= */
const powerText = document.getElementById("power");
const coinsText = document.getElementById("coins");
const roundText = document.getElementById("round");

const monsterBar = document.getElementById("monsterBar");
const monsterHpText = document.getElementById("monsterHp");

const trainBtn = document.getElementById("trainBtn");
const upgradeBtn = document.getElementById("upgradeBtn");
const autoBtn = document.getElementById("autoBtn");

const statsBtn = document.getElementById("statsBtn");
const invBtn = document.getElementById("invBtn");
const skillBtn = document.getElementById("skillBtn");

const panel = document.getElementById("panel");

/* =========================
   FLOATING DAMAGE TEXT
========================= */
function floatText(text, crit = false) {
  const el = document.createElement("div");
  el.textContent = text;
  el.style.position = "absolute";
  el.style.left = "50%";
  el.style.top = "50%";
  el.style.transform = "translate(-50%, -50%)";
  el.style.color = crit ? "gold" : "white";
  el.style.fontSize = "18px";
  el.style.pointerEvents = "none";
  document.body.appendChild(el);

  setTimeout(() => el.remove(), 500);
}

/* =========================
   DAMAGE
========================= */
function getDamage() {
  let dmg = power + weapon.bonus + skills.strength;

  let critRoll = critChance + skills.crit * 0.02;

  if (Math.random() < critRoll) {
    stats.crits++;
    floatText("CRIT!", true);
    return Math.floor(dmg * critMultiplier);
  }

  return Math.floor(dmg);
}

function damageMonster(dmg) {
  monsterHp -= dmg;
  stats.totalDamage += dmg;

  floatText("-" + dmg);

  if (monsterHp <= 0) killMonster();

  updateUI();
}

/* =========================
   MONSTER DEATH + LOOT
========================= */
function killMonster() {
  stats.monstersKilled++;

  let reward = bossWave ? 120 + wave * 10 : 10 + wave * 2;

  reward += skills.income * 5;

  coins += reward;

  tryLootDrop();

  nextWave();
}

/* =========================
   LOOT SYSTEM
========================= */
function tryLootDrop() {
  let chance = bossWave ? 0.6 : 0.2;

  if (Math.random() < chance) {
    stats.lootDrops++;

    let loot = weapons[Math.floor(Math.random() * weapons.length)];

    floatText("LOOT: " + loot.name, true);

    weapon = loot;
  }
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

  if (wave % 3 === 0) skillPoints++;

  updateUI();
}

/* =========================
   TRAIN
========================= */
trainBtn.onclick = () => {
  damageMonster(getDamage());
};

/* =========================
   POWER UPGRADE
========================= */
upgradeBtn.onclick = () => {
  if (coins >= powerCost) {
    coins -= powerCost;
    power++;

    powerCost = Math.floor(powerCost * 1.35);

    updateUI();
  }
};

/* =========================
   SPEED UPGRADE
========================= */
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
    <p>Loot: ${stats.lootDrops}</p>
    <p>Prestiges: ${stats.prestiges}</p>

    <hr>

    <button onclick="prestige()">Prestige (Wave 20+)</button>
  `;
};

invBtn.onclick = () => {
  let html = `<h3>🎒 Inventory</h3><p>${weapon.name}</p>`;

  weapons.forEach((w, i) => {
    html += `
      <button onclick="buyWeapon(${i})">
        ${w.name} (${w.rarity})
      </button>
    `;
  });

  panel.innerHTML = html;
};

skillBtn.onclick = () => {
  panel.innerHTML = `
    <h3>🌳 Skill Tree</h3>
    <p>Points: ${skillPoints}</p>

    <button onclick="upgradeSkill('strength')">Strength</button>
    <button onclick="upgradeSkill('crit')">Crit</button>
    <button onclick="upgradeSkill('income')">Income</button>
  `;
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
   SKILLS
========================= */
function upgradeSkill(s) {
  if (skillPoints <= 0) return;

  skillPoints--;

  skills[s]++;

  updateUI();
}
window.upgradeSkill = upgradeSkill;

/* =========================
   PRESTIGE
========================= */
function prestige() {
  if (wave < 20) {
    alert("Need Wave 20 to Prestige 😭");
    return;
  }

  stats.prestiges++;

  power = 1;
  speed = 0;

  powerCost = 10;
  speedCost = 50;

  coins = 0;

  critChance += 0.05;

  wave = 1;

  weapon = weapons[0];

  monsterHp = 50;
  monsterMaxHp = 50;

  updateUI();
}
window.prestige = prestige;

/* =========================
   UI
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

  upgradeBtn.textContent = `💪 Upgrade Power (${powerCost})`;
  autoBtn.textContent = `⚡ Upgrade Speed (${speedCost})`;
}

/* =========================
   START
========================= */
updateUI();
