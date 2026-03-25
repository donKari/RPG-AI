// de.js

export function shouldRoll(text) {
    const actionKeywords = ['attaque', 'frappe', 'tue', 'lance', 'sort', 'saute', 'grimpe', 'fouille', 'vole', 'crochète', 'pousse', 'esquive'];
    const lowerText = text.toLowerCase();
    const isAction = actionKeywords.some(kw => lowerText.includes(kw));
    
    // 50% de chance de déclencher le dé sur une action pour garder le côté "rare"
    return isAction && Math.random() < 0.5;
}

export function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

export function showDiceAnimation(result) {
    let wrapper = document.getElementById('dice-animation');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = 'dice-animation';
        wrapper.innerHTML = `
            <div class="dice-container" id="dice-cube">
                <div class="face face-1" data-value="1"></div>
                <div class="face face-2" data-value="2"></div>
                <div class="face face-3" data-value="3"></div>
                <div class="face face-4" data-value="4"></div>
                <div class="face face-5" data-value="5"></div>
                <div class="face face-6" data-value="6"></div>
            </div>
        `;
        document.body.appendChild(wrapper);
    }

    const cube = document.getElementById('dice-cube');
    wrapper.classList.remove('hidden');

    // Définition des rotations pour tomber sur la bonne face
    const rotations = {
        1: { x: 0, y: 0 },
        2: { x: 0, y: 180 },
        3: { x: 0, y: -90 },
        4: { x: 0, y: 90 },
        5: { x: -90, y: 0 },
        6: { x: 90, y: 0 }
    };

    const target = rotations[result];
    // On ajoute plusieurs tours complets (720deg+) pour l'effet de lancer
    const extraSpinX = 720 + target.x;
    const extraSpinY = 720 + target.y;

    cube.style.transform = `rotateX(${extraSpinX}deg) rotateY(${extraSpinY}deg)`;

    // Disparition après 4 secondes
    setTimeout(() => {
        wrapper.classList.add('hidden');
        cube.style.transform = `rotateX(0deg) rotateY(0deg)`; // Reset pour le prochain coup
    }, 4000);
}

export function detectStatFromAction(text) {
    // Gardé pour la logique de l'IA si besoin
    return "Action"; 
}
