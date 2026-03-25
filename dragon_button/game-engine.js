// ============================================================
//  GAME ENGINE — Magie & Dragons
//  Moteur de jeu structuré avec état persistant + IA en JSON
// ============================================================

// ==================== ÉTAT DU JEU ====================
let gameState = {
  location: "Inconnu",
  situation: "Calme",
  enemy: null,          // { name, hp, maxHp, force }
  player: { hp: 0, maxHp: 0 },
  inventory: [],
  lastEvent: "Début de l'aventure",
  turn: 0
};

// ==================== CONSTANTES ====================
const PLAYER_BASE_FORCE = 8;      // dégâts de base du joueur
const ENEMY_BASE_FORCE = 8;       // dégâts de base d'un ennemi
const VARIANCE = 4;               // ±variance aléatoire sur les dégâts

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

// ==================== CALCUL DES DÉGÂTS (CÔTÉ JS) ====================
function calcPlayerDamage(character) {
  const force = character?.stats?.force ?? PLAYER_BASE_FORCE;
  const base = Math.floor(force / 2) + PLAYER_BASE_FORCE;
  return Math.max(1, rand(base - VARIANCE, base + VARIANCE));
}

function calcEnemyDamage(enemy, character) {
  const defense = character?.stats?.defense ?? 0;
  const reduction = Math.floor(defense / 4);
  const base = (enemy?.force ?? ENEMY_BASE_FORCE) + rand(0, VARIANCE);
  return Math.max(1, base - reduction);
}

// ==================== MISE À JOUR DE L'ÉTAT ====================
function applyGameStateUpdate(update) {
  if (!update) return;

  if (update.new_location && update.new_location !== gameState.location) {
    gameState.location = update.new_location;
  }
  if (update.event) gameState.lastEvent = update.event;
  if (update.enemy_name) {
    if (!gameState.enemy) {
      const hp = update.enemy_hp ?? 30;
      gameState.enemy = {
        name: update.enemy_name,
        hp,
        maxHp: hp,
        force: update.enemy_force ?? ENEMY_BASE_FORCE
      };
    } else if (update.enemy_hp !== null && update.enemy_hp !== undefined) {
      // On ignore l'HP ennemi suggéré par l'IA — on le calcule côté JS
    }
  }
  if (update.enemy_defeated) {
    gameState.enemy = null;
  }
  if (update.situation) gameState.situation = update.situation;
  if (update.new_item) gameState.inventory.push(update.new_item);

  gameState.turn++;
  saveGameState();
}

function applyPlayerDamage(amount) {
  if (!currentCharacter) return;

  const prev = currentCharacter.hp;
  currentCharacter.hp = Math.max(0, currentCharacter.hp - amount);
  gameState.player.hp = currentCharacter.hp;

  updateHPBar(prev, currentCharacter.hp, currentCharacter.maxHp);
  localStorage.setItem('currentCharacter', JSON.stringify(currentCharacter));
  saveGameState();
}

function applyEnemyDamage(amount) {
  if (!gameState.enemy) return;
  gameState.enemy.hp = Math.max(0, gameState.enemy.hp - amount);
  if (gameState.enemy.hp <= 0) {
    gameState.enemy = null;
  }
  saveGameState();
}

// ==================== MISE À JOUR HP (ANIMATION) ====================
function updateHPBar(prevHp, newHp, maxHp) {
  const hpBar = document.getElementById('hp-bar');
  const hpText = document.getElementById('hp-text');
  if (!hpBar || !hpText) return;

  const percent = Math.max(0, (newHp / maxHp) * 100);
  hpText.textContent = `${newHp} / ${maxHp}`;
  hpBar.style.width = percent + '%';

  // Flash rouge si dégâts
  if (newHp < prevHp) {
    hpBar.style.background = 'linear-gradient(to right, #dc2626, #991b1b)';
    hpBar.style.boxShadow = '0 0 16px #ef444480';
    const card = document.getElementById('character-info');
    if (card) {
      card.style.animation = 'damageFlash 0.4s ease';
      setTimeout(() => { card.style.animation = ''; }, 400);
    }
    setTimeout(() => {
      hpBar.style.background = 'linear-gradient(to right, #f43f5e, #e11d48)';
      hpBar.style.boxShadow = '';
    }, 500);
  }

  // Flash vert si heal
  if (newHp > prevHp) {
    hpBar.style.background = 'linear-gradient(to right, #22c55e, #16a34a)';
    hpBar.style.boxShadow = '0 0 16px #22c55e80';
    setTimeout(() => {
      hpBar.style.background = 'linear-gradient(to right, #f43f5e, #e11d48)';
      hpBar.style.boxShadow = '';
    }, 800);
  }
}

// ==================== PROMPT SYSTÈME STRUCTURÉ ====================
function buildSystemPrompt() {
  let playerStats = "";
  if (currentCharacter) {
    const c = currentCharacter;
    playerStats = `
=== JOUEUR ===
Nom : ${c.name}
Race / Classe : ${c.race} ${c.class}
Force : ${c.stats.force} | Défense : ${c.stats.defense} | Dextérité : ${c.stats.dexterite} | Intelligence : ${c.stats.intelligence}
HP actuels : ${c.hp} / ${c.maxHp}`;
  }

  const enemyBlock = gameState.enemy
    ? `\n=== ENNEMI ACTUEL ===\nNom : ${gameState.enemy.name}\nHP ennemi : ${gameState.enemy.hp} / ${gameState.enemy.maxHp}`
    : `\n=== ENNEMI === Aucun ennemi en cours`;

  const inventoryBlock = gameState.inventory.length
    ? `\n=== INVENTAIRE ===\n${gameState.inventory.join(', ')}`
    : '';

  return `Tu es un Maître du Jeu expert en dark fantasy immersive.
Tu réponds EXCLUSIVEMENT en JSON valide, sans aucun texte en dehors du JSON.
Tu réponds TOUJOURS en français.
${playerStats}
${enemyBlock}
${inventoryBlock}

=== ÉTAT DU MONDE ===
Lieu actuel : ${gameState.location}
Situation : ${gameState.situation}
Dernier événement : ${gameState.lastEvent}
Tour : ${gameState.turn}
Scénario global : "${currentScenario || 'Aventure libre'}"

=== RÈGLES STRICTES ===
1. Ne jamais inventer ou modifier les stats du joueur.
2. Tu NE CALCULES PAS les dégâts — le moteur JS le fait. Ne mets PAS de valeurs player_hp ni enemy_hp dans update.
3. Si un combat démarre, inclure dans "update" : enemy_name et enemy_force (force de l'ennemi, typiquement 5-20).
4. Si l'ennemi est vaincu, mettre "enemy_defeated": true dans update.
5. Toujours proposer 2 à 4 choix pertinents au joueur.
6. Rester cohérent avec le gameState à chaque tour.
7. La narration doit être immersive, sensorielle, littéraire (4 à 6 phrases max).

=== FORMAT DE RÉPONSE OBLIGATOIRE ===
{
  "narration": "texte immersif ici",
  "choices": ["Choix 1", "Choix 2", "Choix 3"],
  "update": {
    "new_location": "string ou null",
    "situation": "Combat | Calme | Exploration | Dialogue | Danger",
    "event": "résumé court de ce qui vient de se passer",
    "enemy_name": "nom de l'ennemi si combat démarre, sinon null",
    "enemy_force": 10,
    "enemy_defeated": false,
    "new_item": "objet trouvé ou null"
  }
}`;
}

// ==================== PARSER JSON ROBUSTE ====================
function parseGMResponse(raw) {
  // Nettoyer les balises markdown si présentes
  let clean = raw.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // Extraire le JSON si entouré de texte parasite
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (jsonMatch) clean = jsonMatch[0];

  try {
    return JSON.parse(clean);
  } catch (e) {
    console.warn("JSON parse failed, using fallback:", e);
    return {
      narration: raw,
      choices: ["Explorer", "Attendre", "Regarder autour"],
      update: { event: "réponse non structurée", situation: gameState.situation }
    };
  }
}

// ==================== AFFICHAGE DES CHOIX ====================
function renderChoices(choices) {
  const container = document.getElementById('choices-container');
  if (!container) return;

  // Vider et animer l'entrée
  container.innerHTML = '';
  container.style.opacity = '0';
  container.style.transform = 'translateY(12px)';

  if (!choices || choices.length === 0) {
    container.style.opacity = '1';
    container.style.transform = '';
    return;
  }

  choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.style.cssText = `
      width: 100%;
      padding: 14px 18px;
      margin-bottom: 10px;
      border-radius: 14px;
      border: 1px solid var(--col-border);
      background: rgba(20, 20, 40, 0.7);
      color: #f1f5f9;
      font-size: 0.95rem;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(4px);
      opacity: 0;
      transform: translateX(-8px);
      animation: choiceSlideIn 0.3s ease ${i * 0.08}s forwards;
    `;
    btn.innerHTML = `<span style="color:var(--col-accent); margin-right:8px;">${['①','②','③','④'][i] || '•'}</span>${choice}`;
    btn.onmouseenter = () => {
      btn.style.background = 'rgba(var(--col-btn-rgb, 100,60,200), 0.35)';
      btn.style.borderColor = 'var(--col-accent)';
      btn.style.transform = 'translateX(4px)';
    };
    btn.onmouseleave = () => {
      btn.style.background = 'rgba(20, 20, 40, 0.7)';
      btn.style.borderColor = 'var(--col-border)';
      btn.style.transform = 'translateX(0)';
    };
    btn.onclick = () => {
      quickAction(choice);
      // Désactiver tous les boutons après clic
      container.querySelectorAll('.choice-btn').forEach(b => {
        b.disabled = true;
        b.style.opacity = '0.4';
        b.style.cursor = 'not-allowed';
      });
    };
    container.appendChild(btn);
  });

  // Transition d'apparition globale
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    });
  });
}

// ==================== BARRE ENNEMI ====================
function renderEnemyBar() {
  const sidebar = document.getElementById('enemy-bar-container');
  if (!sidebar) return;

  if (!gameState.enemy) {
    sidebar.innerHTML = '';
    return;
  }

  const e = gameState.enemy;
  const pct = Math.max(0, (e.hp / e.maxHp) * 100);

  sidebar.innerHTML = `
    <div class="rounded-2xl p-4 mt-4" style="background:rgba(30,10,10,0.8); border:1px solid #7f1d1d;">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-xl">⚔️</span>
        <span class="font-bold text-red-300">${e.name}</span>
      </div>
      <div class="flex justify-between text-xs mb-1">
        <span style="color:#f87171;">PV Ennemi</span>
        <span class="font-mono text-red-300">${e.hp} / ${e.maxHp}</span>
      </div>
      <div class="h-2 bg-zinc-900 rounded-full overflow-hidden">
        <div id="enemy-hp-bar"
             class="h-full rounded-full transition-all duration-500"
             style="width:${pct}%; background: linear-gradient(to right, #dc2626, #b91c1c);">
        </div>
      </div>
    </div>
  `;
}

// ==================== APPEL À L'IA REFACTORISÉ ====================
async function callGM(initialPrompt = null) {
  const loadingDiv = showLoading();
  renderChoices([]); // Vider les choix pendant le chargement

  try {
    const systemPrompt = buildSystemPrompt();

    const messages = initialPrompt
      ? [{ role: "user", content: initialPrompt }]
      : conversationHistory;

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

    const data = await response.json();
    const rawReply = data.choices?.[0]?.message?.content || '{}';

    loadingDiv.remove();

    // Parser la réponse structurée
    const parsed = parseGMResponse(rawReply);

    // --- Appliquer la mise à jour de l'état (avant dégâts) ---
    applyGameStateUpdate(parsed.update);

    // --- Logique de combat côté JS ---
    if (gameState.situation === 'Combat' && gameState.enemy) {
      // Dégâts de l'ennemi sur le joueur
      const enemyDmg = calcEnemyDamage(gameState.enemy, currentCharacter);
      applyPlayerDamage(enemyDmg);

      // Réduction HP ennemi (coup du joueur implicite dans la narration)
      if (currentCharacter) {
        const playerDmg = calcPlayerDamage(currentCharacter);
        applyEnemyDamage(playerDmg);
      }
    }

    // --- Affichage ---
    addMessage(parsed.narration || rawReply, true);
    renderChoices(parsed.choices || []);
    renderEnemyBar();

    // Sauvegarder dans l'historique
    if (!initialPrompt) {
      conversationHistory.push({ role: "assistant", content: rawReply });
    }

  } catch (err) {
    console.error(err);
    loadingDiv.remove();
    addMessage("❌ Le voile magique s'est déchiré... Vérifie ta clé API ou ta connexion.", true);
    renderChoices(["Réessayer", "Attendre"]);
  }
}

// ==================== INJECT CSS ANIMATIONS ====================
(function injectGameEngineStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes choiceSlideIn {
      from { opacity: 0; transform: translateX(-8px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes damageFlash {
      0%   { box-shadow: 0 0 0 0 #ef444460; }
      50%  { box-shadow: 0 0 0 12px #ef444430; }
      100% { box-shadow: 0 0 0 0 transparent; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.5; }
    }
    #choices-container { transition: opacity 0.3s ease, transform 0.3s ease; }
    .choice-btn:active { transform: scale(0.97) !important; }
  `;
  document.head.appendChild(style);
})();

console.log("✅ Game Engine chargé — Moteur structuré actif");
