// de.js

/**
 * Filtre les actions pour ne lancer le dé que si c'est nécessaire (rare et aléatoire)
 */
export function shouldRoll(text) {
    const actionKeywords = [
        'attaque', 'frappe', 'tue', 'lance', 'sortilège', 'magie', 
        'saute', 'grimpe', 'discrétion', 'cache', 'fouille', 
        'examine', 'persuade', 'ment', 'vole', 'crochète', 'pousse',
        'esquive', 'parade', 'soigne', 'force'
    ];
    
    const lowerText = text.toLowerCase();
    const isAction = actionKeywords.some(kw => lowerText.includes(kw));
    
    // Condition de rareté : 60% de chance de lancer le dé SEULEMENT si un mot-clé est présent.
    // Cela évite que le dé sorte pour chaque petite action.
    return isAction && Math.random() < 0.6;
}

/**
 * Détecte quelle statistique utiliser selon le texte
 */
export function detectStatFromAction(text) {
    const t = text.toLowerCase();
    if (/sort|magie|intelligence|étudie|parle/.test(t)) return 'intelligence';
    if (/attaque|frappe|force|pousse|tue/.test(t)) return 'force';
    if (/esquive|saute|cache|discret|vole/.test(t)) return 'dexterite';
    if (/bloque|encaisse|résiste|défend/.test(t)) return 'defense';
    return 'force'; 
}

/**
 * Calcul du jet (1d20 + bonus de stat)
 */
export function rollDice(stat, character) {
    const baseRoll = Math.floor(Math.random() * 20) + 1;
    const statValue = (character.stats && character.stats[stat]) ? character.stats[stat] : 10;
    
    // Calcul du modificateur ( (Stat - 10) / 2 )
    const bonus = Math.floor((statValue - 10) / 2);
    const total = baseRoll + bonus;

    let resultType = "Réussite";
    if (baseRoll === 20) resultType = "CRITIQUE !";
    else if (baseRoll === 1) resultType = "ÉCHEC CRITIQUE !";
    else if (total < 10) resultType = "Échec";
    else if (total >= 18) resultType = "Succès Total";

    return { baseRoll, total, resultType };
}

/**
 * Affiche l'animation visuelle
 */
export function showDiceAnimation(resultText) {
    let container = document.getElementById('dice-animation');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'dice-animation';
        document.body.appendChild(container);
    }

    container.innerHTML = `
        <div class="dice-wrapper">
            <div class="dice-icon">🎲</div>
            <div class="dice-result-text">${resultText}</div>
        </div>
    `;
    
    container.classList.remove('hidden');

    // On cache après 4 secondes (Animation de 3s + 1s de lecture)
    setTimeout(() => {
        container.classList.add('hidden');
    }, 4000);
}
