// ==================== LANCER DE DÉ ====================
export function rollDice(stat, character) {
    const baseRoll = Math.floor(Math.random() * 20) + 1;

    let bonus = 0;
    if (character && character.stats) {
        if (stat === "force") bonus = Math.floor(character.stats.force / 2);
        if (stat === "dexterite") bonus = Math.floor(character.stats.dexterite / 2);
        if (stat === "intelligence") bonus = Math.floor(character.stats.intelligence / 2);
    }

    const total = baseRoll + bonus;

    let resultType = "échec";
    if (baseRoll === 20) resultType = "succès critique";
    else if (baseRoll === 1) resultType = "échec critique";
    else if (total >= 15) resultType = "succès";
    else resultType = "échec";

    return {
        stat,
        baseRoll,
        bonus,
        total,
        resultType
    };
}

// ==================== DÉTECTION STAT ====================
export function detectStatFromAction(action) {
    const lower = action.toLowerCase();

    if (lower.includes("attaquer") || lower.includes("frapper"))
        return "force";

    if (lower.includes("esquiver") || lower.includes("fuir") || lower.includes("discret"))
        return "dexterite";

    if (lower.includes("sort") || lower.includes("magie"))
        return "intelligence";

    if (lower.includes("observer") || lower.includes("analyser"))
        return "intelligence";

    return "force";
}

// ==================== ANIMATION ====================
export function showDiceAnimation(resultText) {
    let container = document.getElementById('dice-animation');

    // Création dynamique si pas présent
    if (!container) {
        container = document.createElement('div');
        container.id = 'dice-animation';
        container.innerHTML = `
            <div class="dice-box">
                <div class="dice">🎲</div>
                <div id="dice-result"></div>
            </div>
        `;
        document.body.appendChild(container);
    }

    const result = container.querySelector('#dice-result');
    result.innerText = resultText;

    container.classList.remove('hidden');

    setTimeout(() => {
        container.classList.add('hidden');
    }, 1200);
}
