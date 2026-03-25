// ======================
//  character-creation.js
// ======================

// Stats de base par classe (somme totale = 42 pour chaque classe)
const classStats = {
    "Guerrier": { force: 16, defense: 15, dexterite: 9,  intelligence: 2  },
    "Mage":     { force: 4,  defense: 8,  dexterite: 10, intelligence: 20 },
    "Voleur":   { force: 8,  defense: 9,  dexterite: 18, intelligence: 7  },
    "Sorcier":  { force: 5,  defense: 7,  dexterite: 11, intelligence: 19 },
    "Rôdeur":   { force: 12, defense: 10, dexterite: 16, intelligence: 4  },
    "Clerc":    { force: 10, defense: 14, dexterite: 8,  intelligence: 10 }
};

// Bonus selon la race (petits ajustements)
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
                
                <!-- Header -->
                <div class="px-8 py-6 border-b border-[var(--col-border)] flex items-center justify-between">
                    <h2 class="text-2xl font-bold magic-glow">👤 Création de Personnage</h2>
                    <button onclick="closeCharacterModal()" 
                            class="text-3xl leading-none hover:text-red-400 transition">×</button>
                </div>

                <div class="p-8 space-y-6">
                    
                    <!-- Nom -->
                    <div>
                        <label class="block text-sm mb-2" style="color: var(--col-text-secondary);">Nom du héros</label>
                        <input id="char-name" type="text" placeholder="Ex: Elara Shadowveil"
                               class="w-full bg-[#1e2937] border border-[var(--col-border)] rounded-2xl px-5 py-4 focus:outline-none text-lg">
                    </div>

                    <!-- Classe + Race -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm mb-2" style="color: var(--col-text-secondary);">Classe</label>
                            <select id="char-class" 
                                    class="w-full bg-[#1e2937] border border-[var(--col-border)] rounded-2xl px-5 py-4 focus:outline-none">
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
                            <select id="char-race" 
                                    class="w-full bg-[#1e2937] border border-[var(--col-border)] rounded-2xl px-5 py-4 focus:outline-none">
                                <option value="Humain">Humain</option>
                                <option value="Elfe">Elfe</option>
                                <option value="Nain">Nain</option>
                                <option value="Orc">Orc</option>
                                <option value="Tieffelin">Tieffelin</option>
                                <option value="Halfelin">Halfelin</option>
                            </select>
                        </div>
                    </div>

                    <!-- Aperçu des stats -->
                    <div id="stats-preview" class="space-y-2"></div>

                    <!-- Background -->
                    <div>
                        <label class="block text-sm mb-2" style="color: var(--col-text-secondary);">Background (optionnel)</label>
                        <textarea id="char-background" rows="3" placeholder="Un ancien mercenaire traqué par son passé..."
                                  class="w-full bg-[#1e2937] border border-[var(--col-border)] rounded-2xl px-5 py-4 resize-none"></textarea>
                    </div>
                </div>

                <!-- Footer -->
                <div class="px-8 py-6 border-t border-[var(--col-border)] flex gap-4">
                    <button onclick="closeCharacterModal()"
                            class="flex-1 py-4 rounded-2xl font-medium transition"
                            style="background: rgba(30,30,50,0.6); border: 1px solid var(--col-border);">
                        Annuler
                    </button>
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

    // Écouteurs d'événements pour mise à jour en direct
    const classSelect = document.getElementById('char-class');
    const raceSelect = document.getElementById('char-race');

    classSelect.addEventListener('change', updateStatsPreview);
    raceSelect.addEventListener('change', updateStatsPreview);

    // Affichage initial des stats
    updateStatsPreview();
}

function updateStatsPreview() {
    const charClass = document.getElementById('char-class').value;
    const race = document.getElementById('char-race').value;

    const baseStats = getClassStats(charClass);
    const bonus = raceBonuses[race] || { force: 0, defense: 0, dexterite: 0, intelligence: 0 };

    const finalStats = {
        force: Math.max(1, baseStats.force + bonus.force),
        defense: Math.max(1, baseStats.defense + bonus.defense),
        dexterite: Math.max(1, baseStats.dexterite + bonus.dexterite),
        intelligence: Math.max(1, baseStats.intelligence + bonus.intelligence)
    };

    const html = `
        <div class="text-xs uppercase tracking-widest mb-2 text-violet-400">Stats du personnage</div>
        <div class="bg-[#1e2937] rounded-2xl p-5 space-y-3 text-sm">
            <div class="flex justify-between items-center">
                <span class="text-red-400 flex items-center gap-2">⚔️ FORCE</span>
                <span class="font-mono font-bold">${finalStats.force}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-blue-400 flex items-center gap-2">🛡️ DÉFENSE</span>
                <span class="font-mono font-bold">${finalStats.defense}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-emerald-400 flex items-center gap-2">🏹 DEXTÉRITÉ</span>
                <span class="font-mono font-bold">${finalStats.dexterite}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-purple-400 flex items-center gap-2">✨ INTELLIGENCE</span>
                <span class="font-mono font-bold">${finalStats.intelligence}</span>
            </div>
        </div>
        <p class="text-[10px] text-center text-gray-500 mt-2">
            Stats de base (${charClass}) + bonus de race (${race})
        </p>
    `;

    document.getElementById('stats-preview').innerHTML = html;
}

function closeCharacterModal() {
    const modal = document.getElementById('character-modal');
    if (modal) modal.remove();
}

async function createCharacterAndStart() {
    const name = document.getElementById('char-name').value.trim() || "Ton Héros";
    const race = document.getElementById('char-race').value;
    const charClass = document.getElementById('char-class').value;
    const background = document.getElementById('char-background').value.trim();

    const baseStats = getClassStats(charClass);
    const bonus = raceBonuses[race] || { force: 0, defense: 0, dexterite: 0, intelligence: 0 };

    const finalStats = {
        force: Math.max(1, baseStats.force + bonus.force),
        defense: Math.max(1, baseStats.defense + bonus.defense),
        dexterite: Math.max(1, baseStats.dexterite + bonus.dexterite),
        intelligence: Math.max(1, baseStats.intelligence + bonus.intelligence)
    };

    // Création de l'objet personnage complet
    const character = {
        name: name,
        race: race,
        class: charClass,
        background: background || "Aucun background renseigné",
        level: 1,
        stats: finalStats,
        hp: 20 + finalStats.defense * 2,
        maxHp: 20 + finalStats.defense * 2,
        // Tu pourras ajouter plus tard : mana, xp, gold, inventaire, etc.
    };

    // Sauvegarde dans le localStorage
    localStorage.setItem('currentCharacter', JSON.stringify(character));

    // Description pour le scénario
    const characterDesc = `${name}, un ${race} ${charClass.toLowerCase()}${background ? ' — ' + background : ''}`;
    document.getElementById('scenario-input').value = characterDesc;

    closeCharacterModal();
    await startNewScenario(); // Appel à ta fonction principale
}
