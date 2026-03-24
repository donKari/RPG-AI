// character-creation.js
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

          <div>
            <label class="block text-sm mb-2" style="color: var(--col-text-secondary);">Background (optionnel)</label>
            <textarea id="char-background" rows="3" placeholder="Un ancien mercenaire traqué par son passé..."
                      class="w-full bg-[#1e2937] border border-[var(--col-border)] rounded-2xl px-5 py-4 resize-none"></textarea>
          </div>
        </div>

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

  const characterDesc = `${name}, un ${race} ${charClass.toLowerCase()}${background ? ' — ' + background : ''}`;

  document.getElementById('scenario-input').value = characterDesc;
  closeCharacterModal();
  await startNewScenario();   // appelle ta fonction du script principal
}
