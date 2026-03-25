// ======================
//  character-creation.js  (Version corrigée)
// ======================

const classStats = {
    "Guerrier": { force: 16, defense: 15, dexterite: 9,  intelligence: 2 },
    "Mage":     { force: 4,  defense: 8,  dexterite: 10, intelligence: 20 },
    "Voleur":   { force: 8,  defense: 9,  dexterite: 18, intelligence: 7 },
    "Sorcier":  { force: 5,  defense: 7,  dexterite: 11, intelligence: 19 },
    "Rôdeur":   { force: 12, defense: 10, dexterite: 16, intelligence: 4 },
    "Clerc":    { force: 10, defense: 14, dexterite: 8,  intelligence: 10 }
};

const raceBonuses = {
    "Humain":    { force: 1, defense: 1, dexterite: 1, intelligence: 1 },
    "Elfe":      { force: -1, defense: -1, dexterite: 3, intelligence: 2 },
    "Nain":      { force: 2, defense: 3, dexterite: -2, intelligence: 0 },
    "Orc":       { force: 4, defense: 1, dexterite: -1, intelligence: -2 },
    "Tieffelin": { force: 1, defense: 0, dexterite: 1, intelligence: 2 },
    "Halfelin":  { force: -2, defense: -1, dexterite: 4, intelligence: 1 }
};

function getClassStats(charClass) {
    return classStats[charClass] || { force: 10, defense: 10, dexterite: 10, intelligence: 10 };
}

function openCharacterCreationModal() {
    let existing = document.getElementById('character-modal');
    if (existing) existing.remove();

    const modalHTML = `
        <div id="character-modal" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div class="bg-[#0f172a] border border-[var(--col-border)] rounded-3xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
                <div class="px-8 py-6 border-b border-[var(--col-border)] flex items-center justify-between">
                    <h2 class="text-2xl font-bold magic-glow">👤 Création de Personnage</h2>
                    <button onclick="closeCharacterModal()" class="text-3xl leading-none hover:text-red-400 transition">×</button>
                </div>

                <div class="p-8 space-y-6">
                    <div>
                        <label class="block text-sm mb-2" style="color: var(--col-text-secondary);">Nom du héros</label>
                        <input id="char-name" type="text" placeholder="Ex: Elara Shadowveil"
                               class="w-full bg-[#1e2937] border border-[var(--col-border)] rounded-2xl px-5 py-4 focus:outline-none text-lg">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm mb-2" style="color: var(--col-text-secondary);">Classe</label>
                            <select id="char-class" class="w-full bg-[#1e2937] border border-[var(--col-border)] rounded-2xl px-5 py-4">
                                <option value="Guerrier">Guerrier</option>
                                <option value="Mage">Mage</option>
                                <option value="Voleur">Voleur</option>
                                <option value="Sorcier">Sorcier</option>
                                <option value="Rôdeur">Rôdeur</option>
                                <option value="Clerc">Clerc</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm mb-2" style="color: var(--col-text-secondary);">Race</label>
                            <select id="char-race" class="w-full bg-[#1e2937] border border-[var(--col-border)] rounded-2xl px-5 py-4">
                                <option value="Humain">Humain</option>
                                <option value="Elfe">Elfe</option>
                                <option value="Nain">Nain</option>
                                <option value="Orc">Orc</option>
                                <option value="Tieffelin">Tieffelin</option>
                                <option value="Halfelin">Halfelin</option>
                            </select>
                        </div>
                    </div>

                    <div id="stats-preview"></div>

                    <div>
                        <label class="block text-sm mb-2" style="color: var(--col-text-secondary);">Background (optionnel)</label>
                        <textarea id="char-background" rows="3" placeholder="Un ancien mercenaire traqué par son passé..."
                                  class="w-full bg-[#1e2937] border border-[var(--col-border)] rounded-2xl px-5 py-4 resize-none"></textarea>
                    </div>
                </div>

                <div class="px-8 py-6 border-t border-[var(--col-border)] flex gap-4">
                    <button onclick="closeCharacterModal()" 
                            class="flex-1 py-4 rounded-2xl font-medium transition"
                            style="background: rgba(30,30,50,0.6); border: 1px solid var(--col-border);">Annuler</button>
                    <button onclick="createCharacterAndStart()" 
                            class="flex-1 py-4 rounded-2xl font-bold transition"
                            style="background: linear-gradient(to right, var(--col-btn-from), var(--col-btn-to));">
                        Créer & Lancer l'aventure
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const classSelect = document.getElementById('char-class');
    const raceSelect = document.getElementById('char-race');
    classSelect.addEventListener('change', updateStatsPreview);
    raceSelect.addEventListener('change', updateStatsPreview);
    updateStatsPreview();
}

function updateStatsPreview() {
    const charClass = document.getElementById('char-class').value;
    const race = document.getElementById('char-race').value;

    const base = getClassStats(charClass);
    const bonus = raceBonuses[race] || { force: 0, defense: 0, dexterite: 0, intelligence: 0 };

    const stats = {
        force: Math.max(1, base.force + bonus.force),
        defense: Math.max(1, base.defense + bonus.defense),
        dexterite: Math.max(1, base.dexterite + bonus.dexterite),
        intelligence: Math.max(1, base.intelligence + bonus.intelligence)
    };

    document.getElementById('stats-preview').innerHTML = `
        <div class="text-xs uppercase tracking-widest mb-2 text-violet-400">Stats du personnage</div>
        <div class="bg-[#1e2937] rounded-2xl p-5 space-y-3 text-sm">
            <div class="flex justify-between"><span class="text-red-400">⚔️ FORCE</span><span class="font-mono">${stats.force}</span></div>
            <div class="flex justify-between"><span class="text-blue-400">🛡️ DÉFENSE</span><span class="font-mono">${stats.defense}</span></div>
            <div class="flex justify-between"><span class="text-emerald-400">🏹 DEXTÉRITÉ</span><span class="font-mono">${stats.dexterite}</span></div>
            <div class="flex justify-between"><span class="text-purple-400">✨ INTELLIGENCE</span><span class="font-mono">${stats.intelligence}</span></div>
        </div>
    `;
}

function closeCharacterModal() {
    const modal = document.getElementById('character-modal');
    if (modal) modal.remove();
}

// ======================
//  CRÉATION + ACTUALISATION
// ======================
async function createCharacterAndStart() {
    const name = document.getElementById('char-name').value.trim() || "Ton Héros";
    const race = document.getElementById('char-race').value;
    const charClass = document.getElementById('char-class').value;
    const background = document.getElementById('char-background').value.trim();

    const base = getClassStats(charClass);
    const bonus = raceBonuses[race] || { force: 0, defense: 0, dexterite: 0, intelligence: 0 };

    const stats = {
        force: Math.max(1, base.force + bonus.force),
        defense: Math.max(1, base.defense + bonus.defense),
        dexterite: Math.max(1, base.dexterite + bonus.dexterite),
        intelligence: Math.max(1, base.intelligence + bonus.intelligence)
    };

    const character = {
        name: name,
        race: race,
        class: charClass,
        background: background || "Aucun background renseigné",
        level: 1,
        stats: stats,
        hp: 20 + stats.defense * 2,
        maxHp: 20 + stats.defense * 2,
    };

    // Sauvegarde
    localStorage.setItem('currentCharacter', JSON.stringify(character));

    // === ACTUALISATION DE LA SIDEBAR ===
    if (typeof window.updateMainPageWithCharacter === "function") {
        window.updateMainPageWithCharacter(character);
    } else {
        console.error("La fonction updateMainPageWithCharacter n'existe pas dans magie-dragons.html");
        alert("Erreur : La fonction de mise à jour de la sidebar n'est pas trouvée.");
    }

    // Lancement du scénario
    const scenarioText = `${name}, un ${race} ${charClass.toLowerCase()}${background ? ' — ' + background : ''}`;
    if (document.getElementById('scenario-input')) {
        document.getElementById('scenario-input').value = scenarioText;
    }

    closeCharacterModal();
    await startNewScenario();
}
