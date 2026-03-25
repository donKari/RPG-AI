// ============================================================
//  GAME ENGINE — Magie & Dragons  (v2.1 — fixes)
//  Corrections : mort du joueur, casse texte, choix inline,
//                troncature de l'historique de conversation
// ============================================================

// ==================== ÉTAT DU JEU ====================
let gameState = {
  location: "Inconnu",
  situation: "Calme",
  enemy: null,
  player: { hp: 0, maxHp: 0 },
  inventory: [],
  lastEvent: "Début de l'aventure",
  turn: 0
};

let playerIsDead = false;

// ==================== CONSTANTES ====================
const PLAYER_BASE_FORCE = 8;
const ENEMY_BASE_FORCE  = 8;
const VARIANCE          = 4;
const MAX_HISTORY_PAIRS = 12; // FIX #4 : garde 12 paires max pour éviter le context overflow

// ==================== UTILITAIRES ====================
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function saveGameState() {
  localStorage.setItem('gameState_v2', JSON.stringify(gameState));
}

function loadGameState() {
  const saved = localStorage.getItem('gameState_v2');
  if (saved) {
    try { gameState = { ...gameState, ...JSON.parse(saved) }; } catch (_) {}
  }
}

// ==================== FIX #4 : TRONCATURE HISTORIQUE ====================
// Sans ça, l'historique dépasse la fenêtre de contexte du modèle
// et l'API retourne une erreur silencieuse après ~10 échanges.
function trimmedHistory() {
  const h = conversationHistory;
  if (h.length <= MAX_HISTORY_PAIRS * 2) return h;
  const head = h.length > 0 ? [h[0]] : [];
  const tail  = h.slice(-(MAX_HISTORY_PAIRS * 2 - head.length));
  return [...head, ...tail];
}

// ==================== CALCUL DES DÉGÂTS ====================
function calcPlayerDamage(character) {
  const force = character?.stats?.force ?? PLAYER_BASE_FORCE;
  const base  = Math.floor(force / 2) + PLAYER_BASE_FORCE;
  return Math.max(1, rand(base - VARIANCE, base + VARIANCE));
}

function calcEnemyDamage(enemy, character) {
  const defense   = character?.stats?.defense ?? 0;
  const reduction = Math.floor(defense / 4);
  const base      = (enemy?.force ?? ENEMY_BASE_FORCE) + rand(0, VARIANCE);
  return Math.max(1, base - reduction);
}

// ==================== MISE À JOUR DE L'ÉTAT ====================
function applyGameStateUpdate(update) {
  if (!update) return;
  if (update.new_location && update.new_location !== gameState.location)
    gameState.location = update.new_location;
  if (update.event)     gameState.lastEvent = update.event;
  if (update.situation) gameState.situation = update.situation;
  if (update.new_item)  gameState.inventory.push(update.new_item);
  if (update.enemy_name && !gameState.enemy) {
    const hp = update.enemy_hp ?? 30;
    gameState.enemy = {
      name:  update.enemy_name,
      hp,
      maxHp: hp,
      force: update.enemy_force ?? ENEMY_BASE_FORCE
    };
  }
  if (update.enemy_defeated) gameState.enemy = null;
  gameState.turn++;
  saveGameState();
}

// ==================== DÉGÂTS JOUEUR ====================
function applyPlayerDamage(amount) {
  if (!currentCharacter) return;
  const prev = currentCharacter.hp;
  currentCharacter.hp = Math.max(0, currentCharacter.hp - amount);
  gameState.player.hp = currentCharacter.hp;
  updateHPBar(prev, currentCharacter.hp, currentCharacter.maxHp);
  localStorage.setItem('currentCharacter', JSON.stringify(currentCharacter));
  saveGameState();

  // FIX #1 — déclencher l'écran de mort si HP atteint 0
  if (currentCharacter.hp <= 0 && !playerIsDead) {
    playerIsDead = true;
    setTimeout(showDeathScreen, 450);
  }
}

function applyEnemyDamage(amount) {
  if (!gameState.enemy) return;
  gameState.enemy.hp = Math.max(0, gameState.enemy.hp - amount);
  if (gameState.enemy.hp <= 0) gameState.enemy = null;
  saveGameState();
}

// ==================== FIX #1 : ÉCRAN DE MORT ====================
function showDeathScreen() {
  const input   = document.getElementById('user-input');
  const sendBtn = document.querySelector('button[onclick="sendMessage()"]');
  if (input)   { input.disabled = true; input.placeholder = "Vous êtes mort…"; }
  if (sendBtn) sendBtn.disabled = true;

  document.querySelectorAll('.inline-choices').forEach(el => el.remove());

  const chatContainer = document.getElementById('chat-container');
  const deathDiv = document.createElement('div');
  deathDiv.id = 'death-screen';
  deathDiv.style.cssText = `
    max-width:42rem; margin:1.5rem auto; padding:2rem;
    border-radius:1.5rem; background:rgba(30,0,0,0.94);
    border:2px solid #7f1d1d; text-align:center;
    animation:deathAppear 0.6s ease forwards;
  `;
  deathDiv.innerHTML = `
    <div style="font-size:3rem;margin-bottom:0.75rem;">💀</div>
    <h2 style="color:#ef4444;font-size:1.6rem;font-weight:bold;margin-bottom:0.5rem;">
      ${currentCharacter?.name ?? 'Héros'} est tombé…
    </h2>
    <p style="color:#fca5a5;margin-bottom:1.5rem;line-height:1.6;">
      Vos blessures vous ont emporté dans l'obscurité éternelle.
      L'aventure s'achève ici, mais une nouvelle peut toujours commencer…
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
  chatContainer.appendChild(deathDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function restartAfterDeath() {
  if (currentCharacter) {
    currentCharacter.hp = currentCharacter.maxHp;
    localStorage.setItem('currentCharacter', JSON.stringify(currentCharacter));
    updateHPBar(0, currentCharacter.maxHp, currentCharacter.maxHp);
  }
  playerIsDead = false;
  gameState.enemy    = null;
  gameState.situation = 'Calme';
  gameState.turn      = 0;
  saveGameState();

  const input   = document.getElementById('user-input');
  const sendBtn = document.querySelector('button[onclick="sendMessage()"]');
  if (input)   { input.disabled = false; input.placeholder = "Décris ton action ou utilise un choix ci-dessous…"; }
  if (sendBtn) sendBtn.disabled = false;

  const ds = document.getElementById('death-screen');
  if (ds) ds.remove();

  conversationHistory = [];
  document.getElementById('chat-container').innerHTML = '';
  startNewScenario();
}

// ==================== FIX #2 : HP BAR (ne disparaît plus à 0) ====================
function updateHPBar(prevHp, newHp, maxHp) {
  const hpBar  = document.getElementById('hp-bar');
  const hpText = document.getElementById('hp-text');
  if (!hpBar || !hpText) return;

  // Toujours mettre à jour — même à 0 %
  const percent = Math.max(0, (newHp / maxHp) * 100);
  hpText.textContent = `${newHp} / ${maxHp}`;
  hpBar.style.width  = percent + '%';

  if (newHp < prevHp) {
    hpBar.style.background = 'linear-gradient(to right,#dc2626,#991b1b)';
    hpBar.style.boxShadow  = '0 0 16px #ef444480';
    const card = document.getElementById('character-info');
    if (card) {
      card.style.animation = 'damageFlash 0.4s ease';
      setTimeout(() => { card.style.animation = ''; }, 400);
    }
    setTimeout(() => {
      hpBar.style.background = 'linear-gradient(to right,#f43f5e,#e11d48)';
      hpBar.style.boxShadow  = '';
    }, 500);
  }
  if (newHp > prevHp) {
    hpBar.style.background = 'linear-gradient(to right,#22c55e,#16a34a)';
    hpBar.style.boxShadow  = '0 0 16px #22c55e80';
    setTimeout(() => {
      hpBar.style.background = 'linear-gradient(to right,#f43f5e,#e11d48)';
      hpBar.style.boxShadow  = '';
    }, 800);
  }
}

// ==================== PROMPT SYSTÈME ====================
function buildSystemPrompt() {
  let playerStats = "";
  if (currentCharacter) {
    const c = currentCharacter;
    playerStats = `
=== JOUEUR ===
Nom : ${c.name} | Race / Classe : ${c.race} ${c.class}
Force : ${c.stats.force} | Défense : ${c.stats.defense} | Dextérité : ${c.stats.dexterite} | Intelligence : ${c.stats.intelligence}
HP actuels : ${c.hp} / ${c.maxHp}`;
  }

  const enemyBlock = gameState.enemy
    ? `\n=== ENNEMI ACTUEL ===\nNom : ${gameState.enemy.name} | HP : ${gameState.enemy.hp} / ${gameState.enemy.maxHp}`
    : `\n=== ENNEMI === Aucun ennemi en cours`;

  const inventoryBlock = gameState.inventory.length
    ? `\n=== INVENTAIRE ===\n${gameState.inventory.join(', ')}` : '';

  return `Tu es un Maître du Jeu expert en dark fantasy immersive.
Tu réponds EXCLUSIVEMENT en JSON valide, sans aucun texte en dehors du JSON.
Tu réponds TOUJOURS en français, avec une casse normale (jamais tout en majuscules).
${playerStats}
${enemyBlock}
${inventoryBlock}

=== ÉTAT DU MONDE ===
Lieu : ${gameState.location} | Situation : ${gameState.situation}
Dernier événement : ${gameState.lastEvent} | Tour : ${gameState.turn}
Scénario : "${currentScenario || 'Aventure libre'}"

=== RÈGLES STRICTES ===
1. Ne jamais modifier les stats du joueur.
2. Ne PAS calculer ni mettre player_hp ni enemy_hp dans update — le moteur JS s'en charge.
3. Si un combat commence : inclure enemy_name et enemy_force dans update.
4. Si l'ennemi est vaincu : "enemy_defeated": true dans update.
5. Toujours proposer 2 à 4 choix pertinents.
6. Narration immersive et sensorielle, 4 à 6 phrases, casse normale.

=== FORMAT OBLIGATOIRE (JSON pur, rien d'autre) ===
{
  "narration": "texte immersif",
  "choices": ["Choix A", "Choix B", "Choix C"],
  "update": {
    "new_location": null,
    "situation": "Calme",
    "event": "résumé court",
    "enemy_name": null,
    "enemy_force": null,
    "enemy_defeated": false,
    "new_item": null
  }
}`;
}

// ==================== PARSER JSON ROBUSTE ====================
function parseGMResponse(raw) {
  let clean = raw.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (jsonMatch) clean = jsonMatch[0];

  try {
    const parsed = JSON.parse(clean);
    // FIX #2 : corriger la casse côté client aussi, au cas où
    if (parsed.narration) parsed.narration = fixCaps(parsed.narration);
    return parsed;
  } catch (e) {
    console.warn("JSON parse failed, fallback:", e);
    return {
      narration: fixCaps(raw),
      choices: ["Explorer", "Attendre", "Regarder autour"],
      update: { event: "réponse non structurée", situation: gameState.situation }
    };
  }
}

// Corrige un texte majoritairement en majuscules → sentence case
function fixCaps(text) {
  if (!text || typeof text !== 'string') return text;
  const letters = text.replace(/[^a-zA-ZÀ-ÿ]/g, '');
  if (!letters.length) return text;
  const upperRatio = text.replace(/[^A-ZÀÂÇÉÈÊËÎÏÔÙÛÜ]/g, '').length / letters.length;
  if (upperRatio > 0.55) {
    return text
      .toLowerCase()
      .replace(/(^|[.!?…]\s+)([a-zà-ÿ])/g, (m, pre, c) => pre + c.toUpperCase());
  }
  return text;
}

// ==================== FIX #3 : CHOIX INLINE SOUS LE DERNIER MESSAGE ====================
function renderChoicesInChat(choices) {
  // Supprimer les anciens choix inline
  document.querySelectorAll('.inline-choices').forEach(el => el.remove());
  if (!choices || choices.length === 0) return;

  const chatContainer = document.getElementById('chat-container');
  const wrapper = document.createElement('div');
  wrapper.className = 'inline-choices';
  wrapper.style.cssText = `
    max-width:42rem; margin-right:auto; padding:2px 4px 8px 4px;
    display:flex; flex-direction:column; gap:7px;
    opacity:0; transform:translateY(8px);
    transition:opacity 0.3s ease, transform 0.3s ease;
  `;

  choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.style.cssText = `
      padding:11px 18px; border-radius:12px;
      border:1px solid var(--col-border);
      background:rgba(20,20,45,0.78); color:#f1f5f9;
      font-size:0.91rem; text-align:left; cursor:pointer;
      transition:background 0.18s, border-color 0.18s, transform 0.14s;
      backdrop-filter:blur(6px);
      opacity:0;
      animation:choiceSlideIn 0.28s ease ${i * 0.07}s forwards;
    `;
    btn.innerHTML = `<span style="color:var(--col-accent);margin-right:8px;font-size:0.82rem;">${['①','②','③','④'][i]||'▸'}</span>${choice}`;
    btn.onmouseenter = () => {
      btn.style.background  = 'rgba(80,40,160,0.4)';
      btn.style.borderColor = 'var(--col-accent)';
      btn.style.transform   = 'translateX(4px)';
    };
    btn.onmouseleave = () => {
      btn.style.background  = 'rgba(20,20,45,0.78)';
      btn.style.borderColor = 'var(--col-border)';
      btn.style.transform   = 'translateX(0)';
    };
    btn.onclick = () => {
      if (playerIsDead) return;
      wrapper.querySelectorAll('button').forEach(b => {
        b.disabled = true;
        b.style.opacity = '0.3';
        b.style.cursor  = 'not-allowed';
      });
      quickAction(choice);
    };
    wrapper.appendChild(btn);
  });

  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    wrapper.style.opacity   = '1';
    wrapper.style.transform = 'translateY(0)';
  }));
}

// Sidebar droite — copie légère pour accessibilité (optionnel)
function renderChoicesSidebar(choices) {
  const container = document.getElementById('choices-container');
  const hint = document.getElementById('choices-hint');
  if (!container) return;
  container.innerHTML = '';
  if (!choices || choices.length === 0) {
    if (hint) hint.style.display = '';
    return;
  }
  if (hint) hint.style.display = 'none';
  choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.style.cssText = `
      width:100%; padding:9px 13px; margin-bottom:7px;
      border-radius:11px; border:1px solid var(--col-border);
      background:rgba(20,20,40,0.55); color:#94a3b8;
      font-size:0.81rem; text-align:left; cursor:pointer;
      transition:all 0.18s;
    `;
    btn.innerHTML = `<span style="color:var(--col-accent);margin-right:6px;">${['①','②','③','④'][i]||'▸'}</span>${choice}`;
    btn.onclick = () => { if (!playerIsDead) quickAction(choice); };
    container.appendChild(btn);
  });
}

// ==================== BARRE ENNEMI ====================
function renderEnemyBar() {
  const sidebar = document.getElementById('enemy-bar-container');
  if (!sidebar) return;
  if (!gameState.enemy) { sidebar.innerHTML = ''; return; }
  const e   = gameState.enemy;
  const pct = Math.max(0, (e.hp / e.maxHp) * 100);
  sidebar.innerHTML = `
    <div class="rounded-2xl p-4 mt-2" style="background:rgba(30,10,10,0.85);border:1px solid #7f1d1d;">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-xl">⚔️</span>
        <span class="font-bold text-red-300">${e.name}</span>
      </div>
      <div class="flex justify-between text-xs mb-1">
        <span style="color:#f87171;">PV Ennemi</span>
        <span class="font-mono text-red-300">${e.hp} / ${e.maxHp}</span>
      </div>
      <div class="h-2 bg-zinc-900 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-500"
             style="width:${pct}%;background:linear-gradient(to right,#dc2626,#b91c1c);">
        </div>
      </div>
    </div>`;
}

// ==================== APPEL À L'IA ====================
async function callGM(initialPrompt = null) {
  if (playerIsDead) return;

  const loadingDiv = showLoading();

  try {
    const systemPrompt = buildSystemPrompt();

    // FIX #4 : historique tronqué
    const messages = initialPrompt
      ? [{ role: "user", content: initialPrompt }]
      : trimmedHistory();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 900,
        temperature: 0.78
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data     = await response.json();
    const rawReply = data.choices?.[0]?.message?.content || '{}';

    loadingDiv.remove();

    const parsed = parseGMResponse(rawReply);
    applyGameStateUpdate(parsed.update);

    // Combat côté JS
    if (gameState.situation === 'Combat' && gameState.enemy) {
      const enemyDmg = calcEnemyDamage(gameState.enemy, currentCharacter);
      applyPlayerDamage(enemyDmg);

      if (currentCharacter && !playerIsDead) {
        const playerDmg = calcPlayerDamage(currentCharacter);
        applyEnemyDamage(playerDmg);
      }
    }

    addMessage(parsed.narration || rawReply, true);
    renderChoicesInChat(parsed.choices || []);
    renderChoicesSidebar(parsed.choices || []);
    renderEnemyBar();
    if (typeof updateWorldStatePanel === 'function') updateWorldStatePanel();

    if (!initialPrompt) {
      conversationHistory.push({ role: "assistant", content: rawReply });
    }

  } catch (err) {
    console.error(err);
    loadingDiv.remove();
    addMessage("❌ Le voile magique s'est déchiré… Vérifie ta clé API ou ta connexion.", true);
    renderChoicesInChat(["Réessayer", "Explorer", "Attendre"]);
  }
}

// ==================== STYLES ====================
(function injectGameEngineStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes choiceSlideIn {
      from { opacity:0; transform:translateX(-6px); }
      to   { opacity:1; transform:translateX(0); }
    }
    @keyframes damageFlash {
      0%   { box-shadow:0 0 0 0 #ef444460; }
      50%  { box-shadow:0 0 0 14px #ef444425; }
      100% { box-shadow:0 0 0 0 transparent; }
    }
    @keyframes deathAppear {
      from { opacity:0; transform:scale(0.93); }
      to   { opacity:1; transform:scale(1); }
    }
    @keyframes pulse {
      0%,100% { opacity:1; }
      50%      { opacity:0.5; }
    }
    .inline-choices button:active { transform:scale(0.97) !important; }
  `;
  document.head.appendChild(style);
})();

console.log("✅ Game Engine v2.1 — 4 fixes appliqués");
