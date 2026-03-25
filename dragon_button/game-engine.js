// ╔══════════════════════════════════════════════════════════════╗
// ║   GAME ENGINE — Magie & Dragons  v3.0                       ║
// ║   • Combat JS réel (critique, loot, XP)                     ║
// ║   • Inventaire interactif                                    ║
// ║   • Système XP / Niveaux                                     ║
// ║   • IA = narrateur uniquement                                ║
// ║   • Choix contextuels générés côté JS                        ║
// ║   • Sauvegarde localStorage                                  ║
// ╚══════════════════════════════════════════════════════════════╝

// ══════════════════════════════════════════════
//  1. ÉTAT DU JEU
// ══════════════════════════════════════════════

let gameState = {
  location  : "Inconnu",
  situation : "Calme",     // "Calme" | "Combat" | "Exploration" | "Dialogue" | "Danger"
  enemy     : null,        // { name, hp, maxHp, force, xpReward, lootTable }
  player    : { hp: 0, maxHp: 0 },
  inventory : [],          // [{ name, type, value, icon }]
  lastEvent : "Début de l'aventure",
  turn      : 0,
  xp        : 0,
  level     : 1,
  xpToNext  : 100,         // XP nécessaire pour le prochain niveau
};

let playerIsDead = false;

// ══════════════════════════════════════════════
//  2. CONSTANTES & TABLES
// ══════════════════════════════════════════════

const MAX_HISTORY_PAIRS = 12;  // Troncature historique IA
const CRIT_CHANCE       = 0.2; // 20% de chance de coup critique

// Table de loot par type d'ennemi (mots-clés dans le nom)
const LOOT_TABLE = {
  gobelin  : [{ name: "Dague rouillée",  type: "damage", value: 12, icon: "🗡️" },
              { name: "Pièces de cuivre", type: "gold",   value: 5,  icon: "🪙" }],
  dragon   : [{ name: "Écaille de dragon", type: "armor", value: 8,  icon: "🐉" },
              { name: "Potion de soin",     type: "heal",  value: 40, icon: "🧪" }],
  squelette: [{ name: "Os magique",  type: "damage", value: 10, icon: "🦴" }],
  loup     : [{ name: "Croc de loup", type: "damage", value: 8,  icon: "🐺" },
              { name: "Fourrure",     type: "gold",   value: 3,  icon: "🪙"  }],
  default  : [{ name: "Potion de soin",  type: "heal",   value: 20, icon: "🧪" },
              { name: "Or mystérieux",   type: "gold",   value: 10, icon: "🪙" }],
};

// ══════════════════════════════════════════════
//  3. PERSISTANCE
// ══════════════════════════════════════════════

function saveGameState() {
  localStorage.setItem('gameState_v3', JSON.stringify(gameState));
  if (currentCharacter) {
    localStorage.setItem('currentCharacter', JSON.stringify(currentCharacter));
  }
}

function loadGameState() {
  try {
    const s = localStorage.getItem('gameState_v3');
    if (s) gameState = { ...gameState, ...JSON.parse(s) };
  } catch (_) {}
}

// ══════════════════════════════════════════════
//  4. UTILITAIRES
// ══════════════════════════════════════════════

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Troncature historique : évite le dépassement de contexte API
function trimmedHistory() {
  const h = conversationHistory;
  if (h.length <= MAX_HISTORY_PAIRS * 2) return h;
  const head = h.length > 0 ? [h[0]] : [];
  const tail  = h.slice(-(MAX_HISTORY_PAIRS * 2 - head.length));
  return [...head, ...tail];
}

// Corrige un texte majoritairement en MAJUSCULES → sentence case
function fixCaps(text) {
  if (!text || typeof text !== 'string') return text;
  const letters    = text.replace(/[^a-zA-ZÀ-ÿ]/g, '');
  if (!letters.length) return text;
  const upperRatio = text.replace(/[^A-ZÀÂÇÉÈÊËÎÏÔÙÛÜ]/g, '').length / letters.length;
  if (upperRatio > 0.55) {
    return text.toLowerCase()
      .replace(/(^|[.!?…]\s+)([a-zà-ÿ])/g, (m, pre, c) => pre + c.toUpperCase());
  }
  return text;
}

// Afficher un toast temporaire dans le chat
function showToast(msg, color = '#22c55e') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    max-width:42rem; margin:0 auto 6px auto; padding:10px 18px;
    border-radius:10px; font-size:0.88rem; font-weight:600;
    background:rgba(0,0,0,0.75); border-left:3px solid ${color};
    color:${color}; animation:toastIn 0.3s ease forwards;
  `;
  toast.textContent = msg;
  const cc = document.getElementById('chat-container');
  if (cc) {
    cc.appendChild(toast);
    cc.scrollTop = cc.scrollHeight;
    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }
}

// ══════════════════════════════════════════════
//  5. SYSTÈME DE COMBAT — 100 % côté JS
// ══════════════════════════════════════════════

/**
 * Attaque du joueur sur l'ennemi.
 * Retourne { damage, isCrit }
 */
function playerAttack() {
  if (!gameState.enemy || !currentCharacter) return { damage: 0, isCrit: false };

  const base   = currentCharacter.stats?.force ?? 8;
  const isCrit = Math.random() < CRIT_CHANCE;
  const damage = Math.floor(base * (isCrit ? 2 : 1));

  gameState.enemy.hp = Math.max(0, gameState.enemy.hp - damage);
  saveGameState();
  renderEnemyBar();

  // Afficher chiffre flottant de dégâts
  showDamageNumber(damage, isCrit, false);

  return { damage, isCrit };
}

/**
 * Attaque de l'ennemi sur le joueur.
 * Retourne les dégâts infligés.
 */
function enemyAttack() {
  if (!gameState.enemy || !currentCharacter) return 0;

  const base      = gameState.enemy.force ?? 8;
  const reduction = Math.floor((currentCharacter.stats?.defense ?? 0) / 3);
  const damage    = Math.max(1, base + rand(-2, 3) - reduction);

  applyPlayerDamage(damage);
  showDamageNumber(damage, false, true);

  return damage;
}

/**
 * Résolution d'un round de combat complet.
 * Retourne un objet résumé pour la narration.
 */
function resolveCombatRound() {
  if (!gameState.enemy || !currentCharacter) return null;

  const playerResult = playerAttack();
  let   summary      = { playerDmg: playerResult.damage, isCrit: playerResult.isCrit, enemyDmg: 0, enemyDefeated: false };

  if (gameState.enemy.hp <= 0) {
    summary.enemyDefeated = true;
    onEnemyDefeated();
    return summary;
  }

  summary.enemyDmg = enemyAttack();
  return summary;
}

/**
 * Appelé quand l'ennemi tombe à 0 HP.
 */
function onEnemyDefeated() {
  const enemy   = gameState.enemy;
  const xpGain  = enemy.xpReward ?? (enemy.maxHp * 2);

  // Loot
  const loot = generateLoot(enemy.name);
  loot.forEach(item => {
    gameState.inventory.push(item);
    showToast(`🎁 Butin obtenu : ${item.icon} ${item.name}`, '#facc15');
  });

  // XP
  gainXP(xpGain);
  showToast(`✨ +${xpGain} XP pour avoir vaincu ${enemy.name} !`, '#a78bfa');

  gameState.enemy     = null;
  gameState.situation = 'Calme';
  saveGameState();
  renderEnemyBar();
  renderInventory();
  updateXPBar();
}

// ══════════════════════════════════════════════
//  6. SYSTÈME D'XP ET NIVEAUX
// ══════════════════════════════════════════════

/**
 * Ajoute de l'XP et déclenche le level-up si nécessaire.
 */
function gainXP(amount) {
  gameState.xp     += amount;
  const threshold   = gameState.level * 100;

  if (gameState.xp >= threshold) {
    gameState.xp    -= threshold;
    gameState.level += 1;
    gameState.xpToNext = gameState.level * 100;

    if (currentCharacter) {
      currentCharacter.stats.force     += 2;
      currentCharacter.stats.defense   += 2;
      currentCharacter.stats.dexterite += 1;
      currentCharacter.maxHp           += 10;
      currentCharacter.hp               = currentCharacter.maxHp; // soin complet au level-up
    }

    showLevelUpEffect();
    showToast(`🌟 NIVEAU ${gameState.level} ! Toutes tes stats ont augmenté et tes PV sont restaurés !`, '#f59e0b');
  }

  saveGameState();
  updateXPBar();
}

/**
 * Effet visuel de level-up dans le chat.
 */
function showLevelUpEffect() {
  const cc = document.getElementById('chat-container');
  if (!cc) return;
  const div = document.createElement('div');
  div.style.cssText = `
    max-width:42rem; margin:8px auto; padding:1.2rem 2rem;
    border-radius:1.2rem; text-align:center;
    background:rgba(245,158,11,0.15); border:2px solid #f59e0b;
    animation:levelUpPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
  `;
  div.innerHTML = `
    <div style="font-size:2rem;margin-bottom:4px;">🌟</div>
    <strong style="color:#fbbf24;font-size:1.1rem;">NIVEAU ${gameState.level} atteint !</strong><br>
    <span style="color:#fde68a;font-size:0.85rem;">Force +2 · Défense +2 · Dextérité +1 · PV Max +10</span>
  `;
  cc.appendChild(div);
  cc.scrollTop = cc.scrollHeight;
  // Re-render la fiche perso avec les nouvelles stats
  if (typeof updateMainPageWithCharacter === 'function' && currentCharacter) {
    updateMainPageWithCharacter(currentCharacter);
  }
}

/**
 * Met à jour la barre d'XP dans la sidebar.
 */
function updateXPBar() {
  const bar   = document.getElementById('xp-bar');
  const text  = document.getElementById('xp-text');
  const lvl   = document.getElementById('xp-level');
  const threshold = gameState.level * 100;
  const pct   = Math.min(100, (gameState.xp / threshold) * 100);

  if (bar)  bar.style.width = pct + '%';
  if (text) text.textContent = `${gameState.xp} / ${threshold} XP`;
  if (lvl)  lvl.textContent  = `Niv. ${gameState.level}`;
}

// ══════════════════════════════════════════════
//  7. INVENTAIRE INTERACTIF
// ══════════════════════════════════════════════

/**
 * Utilise un objet de l'inventaire par son index.
 */
function useItem(index) {
  const item = gameState.inventory[index];
  if (!item) return;

  switch (item.type) {
    case 'heal':
      if (!currentCharacter) break;
      const prev = currentCharacter.hp;
      currentCharacter.hp = Math.min(currentCharacter.maxHp, currentCharacter.hp + item.value);
      updateHPBar(prev, currentCharacter.hp, currentCharacter.maxHp);
      showToast(`💊 ${item.name} utilisée — +${item.value} PV récupérés !`, '#22c55e');
      break;

    case 'damage':
      if (!gameState.enemy) {
        showToast(`⚠️ Pas d'ennemi à cibler !`, '#f87171');
        return;
      }
      gameState.enemy.hp = Math.max(0, gameState.enemy.hp - item.value);
      showToast(`💥 ${item.name} lancée — ${item.value} dégâts sur ${gameState.enemy.name} !`, '#f97316');
      showDamageNumber(item.value, false, false);
      renderEnemyBar();
      if (gameState.enemy.hp <= 0) onEnemyDefeated();
      break;

    case 'armor':
      if (!currentCharacter) break;
      currentCharacter.stats.defense += item.value;
      showToast(`🛡️ ${item.name} équipée — Défense +${item.value} !`, '#38bdf8');
      if (typeof updateMainPageWithCharacter === 'function') {
        updateMainPageWithCharacter(currentCharacter);
      }
      break;

    case 'gold':
      showToast(`🪙 ${item.name} ramassé — ${item.value} pièces d'or !`, '#facc15');
      break;
  }

  gameState.inventory.splice(index, 1);
  saveGameState();
  renderInventory();
}

/**
 * Génère un loot selon le nom de l'ennemi (correspondance par mots-clés).
 */
function generateLoot(enemyName) {
  const name = (enemyName || '').toLowerCase();
  for (const [key, table] of Object.entries(LOOT_TABLE)) {
    if (key !== 'default' && name.includes(key)) {
      // Retourne 1 à 2 items aléatoires de la table
      const count = rand(1, Math.min(2, table.length));
      return [...table].sort(() => Math.random() - 0.5).slice(0, count);
    }
  }
  // Loot générique : 1 item sur 2
  const def = LOOT_TABLE.default;
  return rand(0, 1) ? [def[rand(0, def.length - 1)]] : [];
}

/**
 * Affiche l'inventaire dans la sidebar.
 */
function renderInventory() {
  const container = document.getElementById('inventory-panel');
  if (!container) return;

  if (!gameState.inventory.length) {
    container.innerHTML = `<p style="color:#64748b;font-size:0.82rem;text-align:center;padding:8px;">Inventaire vide</p>`;
    return;
  }

  container.innerHTML = gameState.inventory.map((item, i) => `
    <div style="
      display:flex; align-items:center; justify-content:space-between;
      padding:8px 12px; margin-bottom:6px; border-radius:10px;
      background:rgba(20,20,45,0.7); border:1px solid var(--col-border);
      font-size:0.83rem; color:#e2e8f0;
    ">
      <span>${item.icon || '📦'} ${item.name}</span>
      <button onclick="useItem(${i})"
              style="padding:3px 10px; border-radius:8px; font-size:0.75rem; font-weight:bold;
                     background:linear-gradient(to right,var(--col-btn-from),var(--col-btn-to));
                     color:white; border:none; cursor:pointer; white-space:nowrap;"
              onmouseenter="this.style.opacity='0.8'"
              onmouseleave="this.style.opacity='1'">
        Utiliser
      </button>
    </div>
  `).join('');
}

// ══════════════════════════════════════════════
//  8. CHOIX CONTEXTUELS GÉNÉRÉS CÔTÉ JS
// ══════════════════════════════════════════════

/**
 * Retourne des choix pertinents selon la situation de jeu.
 * Ces choix REMPLACENT (ou complètent) ceux de l'IA.
 */
function getContextualChoices() {
  const sit = gameState.situation;
  const hasEnemy     = !!gameState.enemy;
  const hasHealItems = gameState.inventory.some(i => i.type === 'heal');
  const hasDmgItems  = gameState.inventory.some(i => i.type === 'damage');

  if (sit === 'Combat' && hasEnemy) {
    const choices = ['⚔️ Attaquer'];
    if (hasHealItems)  choices.push('💊 Utiliser une potion');
    if (hasDmgItems)   choices.push('💥 Lancer une bombe');
    choices.push('🛡️ Se défendre');
    choices.push('🏃 Fuir le combat');
    return choices;
  }

  if (sit === 'Dialogue') {
    return ['💬 Parler amicalement', '😠 Menacer', '🤝 Négocier', '🚶 Ignorer et partir'];
  }

  if (sit === 'Danger') {
    return ['⚡ Réagir vite', '🕵️ Observer d\'abord', '🏃 Fuir', '🗣️ Appeler à l\'aide'];
  }

  // Exploration / Calme (par défaut)
  return ['🔭 Explorer les environs', '👁️ Observer attentivement', '➡️ Avancer', '💬 Chercher quelqu\'un à qui parler'];
}

// ══════════════════════════════════════════════
//  9. ANIMATIONS VISUELLES
// ══════════════════════════════════════════════

/**
 * Affiche un chiffre flottant de dégâts au-dessus de la barre correspondante.
 * isEnemy = true → dégâts sur le joueur | false → dégâts sur l'ennemi
 */
function showDamageNumber(dmg, isCrit, isEnemy) {
  const anchor = document.getElementById(isEnemy ? 'hp-bar' : 'enemy-hp-bar');
  if (!anchor) return;

  const num = document.createElement('div');
  num.style.cssText = `
    position:absolute; pointer-events:none; font-weight:900;
    font-size:${isCrit ? '1.5rem' : '1.1rem'};
    color:${isEnemy ? '#f87171' : (isCrit ? '#fbbf24' : '#f97316')};
    text-shadow:0 2px 6px rgba(0,0,0,0.8);
    animation:floatUp 1.1s ease forwards;
    z-index:999;
  `;
  num.textContent = (isCrit ? '💥 CRITIQUE ! -' : '-') + dmg;

  // Position relative à l'anchor
  const rect = anchor.getBoundingClientRect();
  num.style.left = (rect.left + rect.width / 2 - 30) + 'px';
  num.style.top  = (rect.top + window.scrollY - 10) + 'px';
  document.body.appendChild(num);
  setTimeout(() => num.remove(), 1200);
}

// ══════════════════════════════════════════════
//  10. GESTION HP JOUEUR
// ══════════════════════════════════════════════

function applyPlayerDamage(amount) {
  if (!currentCharacter) return;
  const prev = currentCharacter.hp;
  currentCharacter.hp = Math.max(0, currentCharacter.hp - amount);
  gameState.player.hp = currentCharacter.hp;
  updateHPBar(prev, currentCharacter.hp, currentCharacter.maxHp);
  saveGameState();

  if (currentCharacter.hp <= 0 && !playerIsDead) {
    playerIsDead = true;
    setTimeout(showDeathScreen, 450);
  }
}

function updateHPBar(prevHp, newHp, maxHp) {
  const hpBar  = document.getElementById('hp-bar');
  const hpText = document.getElementById('hp-text');
  if (!hpBar || !hpText) return;

  const percent = Math.max(0, (newHp / maxHp) * 100);
  hpText.textContent = `${newHp} / ${maxHp}`;
  hpBar.style.width  = percent + '%';

  // Couleur selon HP restants
  const color = percent > 50 ? 'from-rose-500 to-pink-600'
    : percent > 25 ? 'from-orange-500 to-amber-600'
    : 'from-red-700 to-red-900';
  hpBar.className = `h-full rounded-full transition-all duration-500 bg-gradient-to-r ${color}`;

  if (newHp < prevHp) {
    hpBar.style.boxShadow = '0 0 18px #ef444488';
    const card = document.getElementById('character-info');
    if (card) {
      card.style.animation = 'damageFlash 0.4s ease';
      setTimeout(() => { card.style.animation = ''; }, 400);
    }
    setTimeout(() => { hpBar.style.boxShadow = ''; }, 600);
  }
  if (newHp > prevHp) {
    hpBar.style.boxShadow = '0 0 18px #22c55e88';
    setTimeout(() => { hpBar.style.boxShadow = ''; }, 800);
  }
}

// ══════════════════════════════════════════════
//  11. ÉCRAN DE MORT
// ══════════════════════════════════════════════

function showDeathScreen() {
  const input   = document.getElementById('user-input');
  const sendBtn = document.querySelector('button[onclick="sendMessage()"]');
  if (input)   { input.disabled = true; input.placeholder = "Vous êtes mort…"; }
  if (sendBtn) sendBtn.disabled = true;
  document.querySelectorAll('.inline-choices').forEach(el => el.remove());

  const cc = document.getElementById('chat-container');
  const d  = document.createElement('div');
  d.id = 'death-screen';
  d.style.cssText = `
    max-width:42rem; margin:1.5rem auto; padding:2rem;
    border-radius:1.5rem; background:rgba(30,0,0,0.95);
    border:2px solid #7f1d1d; text-align:center;
    animation:deathAppear 0.6s ease forwards;
  `;
  d.innerHTML = `
    <div style="font-size:3rem;margin-bottom:0.75rem;">💀</div>
    <h2 style="color:#ef4444;font-size:1.6rem;font-weight:bold;margin-bottom:0.5rem;">
      ${currentCharacter?.name ?? 'Héros'} est tombé…
    </h2>
    <p style="color:#fca5a5;margin-bottom:0.5rem;line-height:1.6;">
      Vos blessures vous ont emporté dans l'obscurité éternelle.
    </p>
    <p style="color:#94a3b8;font-size:0.85rem;margin-bottom:1.5rem;">
      Niveau ${gameState.level} atteint · ${gameState.turn} tours joués
    </p>
    <button onclick="restartAfterDeath()"
            style="padding:0.75rem 2rem;border-radius:999px;font-weight:bold;font-size:1rem;
                   background:linear-gradient(to right,#dc2626,#7f1d1d);color:white;
                   border:none;cursor:pointer;transition:opacity 0.2s;"
            onmouseenter="this.style.opacity='0.8'"
            onmouseleave="this.style.opacity='1'">
      🔄 Recommencer l'aventure
    </button>
  `;
  cc.appendChild(d);
  cc.scrollTop = cc.scrollHeight;
}

function restartAfterDeath() {
  if (currentCharacter) {
    currentCharacter.hp = currentCharacter.maxHp;
    saveGameState();
    updateHPBar(0, currentCharacter.maxHp, currentCharacter.maxHp);
  }
  playerIsDead        = false;
  gameState.enemy     = null;
  gameState.situation = 'Calme';
  gameState.turn      = 0;
  gameState.xp        = 0;
  gameState.level     = 1;
  gameState.xpToNext  = 100;
  gameState.inventory = [];
  saveGameState();

  const input   = document.getElementById('user-input');
  const sendBtn = document.querySelector('button[onclick="sendMessage()"]');
  if (input)   { input.disabled = false; input.placeholder = "Décris ton action ou utilise un choix ci-dessous…"; }
  if (sendBtn) sendBtn.disabled = false;

  const ds = document.getElementById('death-screen');
  if (ds) ds.remove();

  conversationHistory = [];
  document.getElementById('chat-container').innerHTML = '';
  renderInventory();
  updateXPBar();
  startNewScenario();
}

// ══════════════════════════════════════════════
//  12. BARRE ENNEMI
// ══════════════════════════════════════════════

function renderEnemyBar() {
  const sidebar = document.getElementById('enemy-bar-container');
  if (!sidebar) return;
  if (!gameState.enemy) { sidebar.innerHTML = ''; return; }
  const e   = gameState.enemy;
  const pct = Math.max(0, (e.hp / e.maxHp) * 100);
  const col = pct > 50 ? '#dc2626' : pct > 25 ? '#f97316' : '#991b1b';
  sidebar.innerHTML = `
    <div class="rounded-2xl p-4 mt-2" style="background:rgba(30,10,10,0.88);border:1px solid #7f1d1d;position:relative;">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">⚔️</span>
          <span class="font-bold text-red-300">${e.name}</span>
        </div>
        <span class="text-xs font-mono text-red-300">${e.hp}/${e.maxHp}</span>
      </div>
      <div class="h-2 bg-zinc-900 rounded-full overflow-hidden">
        <div id="enemy-hp-bar" class="h-full rounded-full transition-all duration-500"
             style="width:${pct}%;background:linear-gradient(to right,${col},${col}aa);">
        </div>
      </div>
      <div class="flex justify-between mt-2 text-xs" style="color:#64748b;">
        <span>Force : ${e.force ?? 8}</span>
        <span>XP : +${e.xpReward ?? e.maxHp * 2}</span>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════
//  13. AFFICHAGE DES CHOIX (inline dans le chat)
// ══════════════════════════════════════════════

/**
 * Affiche les boutons de choix directement sous le dernier message du MJ.
 * Prend en priorité les choix contextuels JS, complétés/remplacés par les choix IA.
 */
function renderChoicesInChat(aiChoices) {
  document.querySelectorAll('.inline-choices').forEach(el => el.remove());

  // Fusion : choix JS contextuels en priorité, choix IA en complément
  const ctxChoices = getContextualChoices();
  const choices    = ctxChoices.length ? ctxChoices : (aiChoices || []);

  if (!choices.length) return;

  const cc = document.getElementById('chat-container');
  const wrapper = document.createElement('div');
  wrapper.className = 'inline-choices';
  wrapper.style.cssText = `
    max-width:42rem; margin-right:auto; padding:2px 4px 10px 4px;
    display:flex; flex-direction:column; gap:6px;
    opacity:0; transform:translateY(8px);
    transition:opacity 0.3s ease, transform 0.3s ease;
  `;

  choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    const isCombat = gameState.situation === 'Combat' && gameState.enemy;
    btn.style.cssText = `
      padding:11px 18px; border-radius:12px;
      border:1px solid var(--col-border);
      background:rgba(20,20,45,0.8); color:#f1f5f9;
      font-size:0.91rem; text-align:left; cursor:pointer;
      transition:background 0.18s, border-color 0.18s, transform 0.14s;
      backdrop-filter:blur(6px);
      opacity:0;
      animation:choiceSlideIn 0.28s ease ${i * 0.07}s forwards;
    `;
    btn.innerHTML = `<span style="color:var(--col-accent);margin-right:8px;font-size:0.82rem;">${['①','②','③','④','⑤'][i]||'▸'}</span>${choice}`;
    btn.onmouseenter = () => {
      btn.style.background  = 'rgba(80,40,160,0.4)';
      btn.style.borderColor = 'var(--col-accent)';
      btn.style.transform   = 'translateX(4px)';
    };
    btn.onmouseleave = () => {
      btn.style.background  = 'rgba(20,20,45,0.8)';
      btn.style.borderColor = 'var(--col-border)';
      btn.style.transform   = 'translateX(0)';
    };
    btn.onclick = () => {
      if (playerIsDead) return;
      wrapper.querySelectorAll('button').forEach(b => {
        b.disabled = true; b.style.opacity = '0.3'; b.style.cursor = 'not-allowed';
      });
      handleChoice(choice);
    };
    wrapper.appendChild(btn);
  });

  cc.appendChild(wrapper);
  cc.scrollTop = cc.scrollHeight;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    wrapper.style.opacity   = '1';
    wrapper.style.transform = 'translateY(0)';
  }));
}

/**
 * Copie légère dans la sidebar pour accessibilité.
 */
function renderChoicesSidebar(choices) {
  const c = document.getElementById('choices-container');
  const h = document.getElementById('choices-hint');
  if (!c) return;
  c.innerHTML = '';
  const all = getContextualChoices().length ? getContextualChoices() : (choices || []);
  if (!all.length) { if (h) h.style.display = ''; return; }
  if (h) h.style.display = 'none';
  all.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.style.cssText = `
      width:100%; padding:9px 13px; margin-bottom:7px;
      border-radius:11px; border:1px solid var(--col-border);
      background:rgba(20,20,40,0.55); color:#94a3b8;
      font-size:0.81rem; text-align:left; cursor:pointer; transition:all 0.18s;
    `;
    btn.innerHTML = `<span style="color:var(--col-accent);margin-right:6px;">${['①','②','③','④','⑤'][i]||'▸'}</span>${choice}`;
    btn.onclick = () => { if (!playerIsDead) handleChoice(choice); };
    c.appendChild(btn);
  });
}

// ══════════════════════════════════════════════
//  14. GESTIONNAIRE DE CHOIX
// ══════════════════════════════════════════════

/**
 * Traite le choix du joueur.
 * Les actions de combat sont résolues côté JS AVANT d'appeler l'IA.
 */
function handleChoice(choice) {
  const lower = choice.toLowerCase();

  // Attaque directe
  if (lower.includes('attaquer') || lower.includes('⚔️')) {
    if (!gameState.enemy) {
      addMessage(choice, false);
      conversationHistory.push({ role: "user", content: choice });
      callGM();
      return;
    }
    const result = resolveCombatRound();
    addMessage(choice, false);
    conversationHistory.push({ role: "user", content: choice });
    // Construire un résumé de combat pour l'IA
    const summary = result
      ? `Le joueur attaque et inflige ${result.playerDmg} dégâts${result.isCrit ? ' (COUP CRITIQUE !)' : ''}. `
        + (result.enemyDefeated
            ? `L'ennemi est vaincu !`
            : `L'ennemi riposte pour ${result.enemyDmg} dégâts. HP joueur : ${currentCharacter.hp}/${currentCharacter.maxHp}. HP ennemi : ${gameState.enemy?.hp ?? 0}/${gameState.enemy?.maxHp ?? 0}.`)
      : '';
    callGM(null, summary);
    return;
  }

  // Utiliser potion depuis le menu de choix
  if (lower.includes('potion') || lower.includes('💊')) {
    const idx = gameState.inventory.findIndex(i => i.type === 'heal');
    if (idx !== -1) {
      useItem(idx);
      addMessage(choice, false);
      conversationHistory.push({ role: "user", content: choice });
      callGM(null, `Le joueur utilise une potion de soin. HP actuels : ${currentCharacter.hp}/${currentCharacter.maxHp}.`);
    } else {
      showToast('⚠️ Aucune potion en inventaire !', '#f87171');
    }
    return;
  }

  // Lancer une bombe depuis le menu de choix
  if (lower.includes('bombe') || lower.includes('💥')) {
    const idx = gameState.inventory.findIndex(i => i.type === 'damage');
    if (idx !== -1) {
      useItem(idx);
      addMessage(choice, false);
      conversationHistory.push({ role: "user", content: choice });
      callGM(null, `Le joueur utilise une bombe sur l'ennemi. HP ennemi : ${gameState.enemy?.hp ?? 0}/${gameState.enemy?.maxHp ?? 0}.`);
    } else {
      showToast('⚠️ Aucune bombe en inventaire !', '#f87171');
    }
    return;
  }

  // Défense : réduire les dégâts du prochain tour
  if (lower.includes('défendre') || lower.includes('🛡️')) {
    addMessage(choice, false);
    conversationHistory.push({ role: "user", content: choice });
    callGM(null, `Le joueur adopte une posture défensive. Il reçoit moins de dégâts ce tour.`);
    return;
  }

  // Fuite
  if (lower.includes('fuir') || lower.includes('🏃')) {
    const success = Math.random() > 0.4; // 60% de réussite
    if (success) {
      gameState.enemy     = null;
      gameState.situation = 'Calme';
      saveGameState();
      renderEnemyBar();
      showToast('🏃 Vous avez fui le combat !', '#94a3b8');
    }
    addMessage(choice, false);
    conversationHistory.push({ role: "user", content: choice });
    callGM(null, success ? `Le joueur fuit le combat avec succès.` : `Le joueur tente de fuir mais échoue.`);
    return;
  }

  // Toute autre action → passe directement à l'IA
  addMessage(choice, false);
  conversationHistory.push({ role: "user", content: choice });
  callGM();
}

// Proxy vers handleChoice pour compatibilité avec quickAction dans index.html
function quickAction(action) {
  const input = document.getElementById('user-input');
  if (input) input.value = '';
  handleChoice(action);
}

// ══════════════════════════════════════════════
//  15. MISE À JOUR DE L'ÉTAT VIA LA RÉPONSE IA
// ══════════════════════════════════════════════

function applyGameStateUpdate(update) {
  if (!update) return;
  if (update.new_location && update.new_location !== gameState.location)
    gameState.location = update.new_location;
  if (update.event)     gameState.lastEvent = update.event;
  if (update.situation) gameState.situation = update.situation;

  // L'IA peut signaler qu'un ennemi apparaît — on l'instancie côté JS
  if (update.enemy_name && !gameState.enemy) {
    const hp = update.enemy_hp ?? rand(20, 45);
    gameState.enemy = {
      name      : update.enemy_name,
      hp,
      maxHp     : hp,
      force     : update.enemy_force ?? rand(6, 14),
      xpReward  : update.enemy_xp   ?? hp * 2,
      lootTable : null
    };
    gameState.situation = 'Combat';
  }

  // Items narratifs (non structurés) ajoutés par l'IA
  if (update.new_item && typeof update.new_item === 'string') {
    gameState.inventory.push({ name: update.new_item, type: 'gold', value: 5, icon: '📦' });
    renderInventory();
  }

  gameState.turn++;
  saveGameState();
  if (typeof updateWorldStatePanel === 'function') updateWorldStatePanel();
  renderEnemyBar();
  updateXPBar();
}

// ══════════════════════════════════════════════
//  16. PROMPT SYSTÈME (IA = NARRATEUR UNIQUEMENT)
// ══════════════════════════════════════════════

function buildSystemPrompt(combatSummary = '') {
  let playerStats = '';
  if (currentCharacter) {
    const c = currentCharacter;
    playerStats = `
=== JOUEUR ===
Nom : ${c.name} | Classe : ${c.race} ${c.class} | Niveau : ${gameState.level}
Force : ${c.stats.force} | Défense : ${c.stats.defense} | Dextérité : ${c.stats.dexterite} | Intelligence : ${c.stats.intelligence}
HP : ${c.hp} / ${c.maxHp} | XP : ${gameState.xp} / ${gameState.level * 100}`;
  }

  const enemyBlock = gameState.enemy
    ? `\n=== ENNEMI ACTUEL ===\nNom : ${gameState.enemy.name} | HP : ${gameState.enemy.hp}/${gameState.enemy.maxHp} | Force : ${gameState.enemy.force}`
    : '\n=== ENNEMI === Aucun';

  const invBlock = gameState.inventory.length
    ? `\n=== INVENTAIRE ===\n${gameState.inventory.map(i => i.name).join(', ')}` : '';

  const combatBlock = combatSummary
    ? `\n=== RÉSULTAT DU ROUND (calculé par le moteur JS) ===\n${combatSummary}` : '';

  return `Tu es un Maître du Jeu expert en dark fantasy immersive. Tu es LE NARRATEUR uniquement.
Tu réponds EXCLUSIVEMENT en JSON valide, sans aucun texte en dehors du JSON.
Tu réponds TOUJOURS en français, avec une casse normale (jamais tout en majuscules).
${playerStats}
${enemyBlock}
${invBlock}
${combatBlock}

=== ÉTAT DU MONDE ===
Lieu : ${gameState.location} | Situation : ${gameState.situation}
Dernier événement : ${gameState.lastEvent} | Tour : ${gameState.turn}
Scénario : "${currentScenario || 'Aventure libre'}"

=== RÔLE STRICT DE L'IA ===
✅ Tu DOIS : décrire les actions, enrichir la narration, proposer des situations narratives.
✅ Tu DOIS : signaler si un ennemi apparaît (enemy_name, enemy_force, enemy_hp).
✅ Tu DOIS : décrire les résultats de combat fournis par le moteur JS (combatSummary).
❌ Tu NE DOIS PAS : calculer des dégâts toi-même.
❌ Tu NE DOIS PAS : modifier player_hp ni enemy_hp dans update.
❌ Tu NE DOIS PAS : inventer de nouvelles stats.
❌ Tu NE DOIS PAS : décider du résultat d'un combat — le moteur JS décide.

=== FORMAT OBLIGATOIRE (JSON pur, rien d'autre) ===
{
  "narration": "texte immersif de 4 à 6 phrases",
  "choices": [],
  "update": {
    "new_location": null,
    "situation": "Calme",
    "event": "résumé court",
    "enemy_name": null,
    "enemy_force": null,
    "enemy_hp": null,
    "enemy_xp": null,
    "enemy_defeated": false,
    "new_item": null
  }
}`;
}

// ══════════════════════════════════════════════
//  17. PARSER JSON ROBUSTE
// ══════════════════════════════════════════════

function parseGMResponse(raw) {
  let clean = raw.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  const m = clean.match(/\{[\s\S]*\}/);
  if (m) clean = m[0];
  try {
    const p = JSON.parse(clean);
    if (p.narration) p.narration = fixCaps(p.narration);
    return p;
  } catch (e) {
    console.warn('JSON parse failed, fallback:', e);
    return {
      narration : fixCaps(raw) || 'Le Maître du Jeu réfléchit…',
      choices   : [],
      update    : { event: 'réponse non structurée', situation: gameState.situation }
    };
  }
}

// ══════════════════════════════════════════════
//  18. APPEL À L'IA (narrateur pur)
// ══════════════════════════════════════════════

async function callGM(initialPrompt = null, combatSummary = '') {
  if (playerIsDead) return;

  const loadingDiv = showLoading();

  try {
    const systemPrompt = buildSystemPrompt(combatSummary);
    const messages = initialPrompt
      ? [{ role: 'user', content: initialPrompt }]
      : trimmedHistory();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method  : 'POST',
      headers : { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body    : JSON.stringify({
        model      : 'llama-3.3-70b-versatile',
        messages   : [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens : 900,
        temperature: 0.78
      })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errMsg  = errBody?.error?.message || `HTTP ${response.status}`;

      if (response.status === 429) {
        loadingDiv.querySelector('p').textContent = '⏳ Limite atteinte, nouvelle tentative dans 8 s…';
        await new Promise(r => setTimeout(r, 8000));
        loadingDiv.remove();
        return callGM(initialPrompt, combatSummary);
      }
      if (response.status === 400 && errMsg.includes('context')) {
        conversationHistory = conversationHistory.slice(-8);
        loadingDiv.remove();
        return callGM(initialPrompt, combatSummary);
      }
      throw new Error(errMsg);
    }

    const data     = await response.json();
    const rawReply = data.choices?.[0]?.message?.content || '{}';
    loadingDiv.remove();

    const parsed = parseGMResponse(rawReply);
    applyGameStateUpdate(parsed.update);

    addMessage(parsed.narration || rawReply, true);
    renderChoicesInChat(parsed.choices || []);
    renderChoicesSidebar(parsed.choices || []);

    if (!initialPrompt) {
      conversationHistory.push({ role: 'assistant', content: rawReply });
    }

  } catch (err) {
    console.error(err);
    loadingDiv.remove();
    addMessage('❌ Le voile magique s\'est déchiré… Vérifie ta clé API ou ta connexion.', true);
    renderChoicesInChat([]);
  }
}

// ══════════════════════════════════════════════
//  19. STYLES CSS INJECTÉS
// ══════════════════════════════════════════════

(function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes choiceSlideIn {
      from { opacity:0; transform:translateX(-8px); }
      to   { opacity:1; transform:translateX(0); }
    }
    @keyframes damageFlash {
      0%   { box-shadow:0 0 0 0 #ef444460; }
      50%  { box-shadow:0 0 0 16px #ef444422; }
      100% { box-shadow:0 0 0 0 transparent; }
    }
    @keyframes deathAppear {
      from { opacity:0; transform:scale(0.93); }
      to   { opacity:1; transform:scale(1); }
    }
    @keyframes levelUpPop {
      0%   { opacity:0; transform:scale(0.85) translateY(8px); }
      70%  { transform:scale(1.04) translateY(-2px); }
      100% { opacity:1; transform:scale(1) translateY(0); }
    }
    @keyframes floatUp {
      0%   { opacity:1; transform:translateY(0); }
      100% { opacity:0; transform:translateY(-48px); }
    }
    @keyframes toastIn {
      from { opacity:0; transform:translateX(-12px); }
      to   { opacity:1; transform:translateX(0); }
    }
    @keyframes pulse {
      0%,100% { opacity:1; }
      50%      { opacity:0.5; }
    }
    .inline-choices button:active { transform:scale(0.97) !important; }
  `;
  document.head.appendChild(s);
})();

console.log('✅ Game Engine v3.0 — Combat JS · Inventaire · XP/Niveaux · IA narrateur · Choix contextuels');
