// Morse Code Dictionary
const morseCode = {
    "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.", 
    "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..", 
    "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.", 
    "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-", 
    "Y": "-.--", "Z": "--..", "0": "-----", "1": ".----", "2": "..---", 
    "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", 
    "8": "---..", "9": "----.", "!": "-.-.--", "(": "-.--.", ")": "-.--.-", 
    "&": ".-...", ":": "---...", ",": "--..--", "=": "-...-", "-": "-....-", 
    "+": ".-.-.", "?": "..--..", "/": "-..-."
};

// Create reverse dictionary
const reverseMorseCode = {};
Object.entries(morseCode).forEach(([key, value]) => reverseMorseCode[value] = key);

// DOM Elements
const elements = {
    input: document.getElementById("input"),
    output: document.getElementById("output"),
    validation: document.getElementById("validation-message"),
    charCount: document.getElementById("char-count"),
    flasher: document.getElementById("flasher"),
    copy: document.getElementById("copy"),
    test: document.getElementById("test"),
    reverse: document.getElementById("reverse"),
    history: {
        panel: document.getElementById("history-panel"),
        list: document.getElementById("history-list"),
        show: document.getElementById("show-history"),
        clear: document.getElementById("clear-history")
    },
    cheatModal: document.getElementById("cheat-modal"),
    cheatBtn: document.getElementById("cheat-sheet-btn"),
    closeCheatModal: document.getElementById("close-cheat-modal"),
    cheatGrid: document.getElementById("cheat-sheet-grid"),
    notification: document.getElementById('notification')
};

// State
let translationHistory = JSON.parse(localStorage.getItem('morseHistory')) || [];
let historySaveTimeout = null;
let currentAudioCtx = null;
let isAudioPlaying = false;

// Input Validation
function validateInput() {
    const text = elements.input.value;
    const invalidChars = [];
    
    // Update character count
    if (elements.charCount) {
        elements.charCount.textContent = `${text.length} char${text.length === 1 ? '' : 's'}`;
    }

    if (text.includes('.') || text.includes('-')) {
        // Morse code validation
        text.split('').forEach(c => {
            if (![' ', '/', '.', '-'].includes(c) && !reverseMorseCode[c]) {
                invalidChars.push(c);
            }
        });
    } else {
        // Text validation
        text.toUpperCase().split('').forEach(c => {
            if (c !== ' ' && c !== '/' && !morseCode[c] && c !== '\n') {
                invalidChars.push(c);
            }
        });
    }

    if (invalidChars.length > 0) {
        elements.validation.textContent = `Invalid: ${[...new Set(invalidChars)].join(', ')}`;
        elements.validation.classList.add('show');
        elements.input.classList.add('invalid');
        return false;
    }
    
    elements.validation.classList.remove('show');
    elements.input.classList.remove('invalid');
    return true;
}

// Translation Functions
function translateText() {
    const isValid = validateInput();
    const text = elements.input.value.trim();

    if (!text) {
        elements.output.value = "";
        return;
    }

    if (!isValid) {
        elements.output.value = "Invalid characters detected";
        return;
    }

    const translated = text.includes(".") || text.includes("-") 
        ? morseToText(text) 
        : textToMorse(text);

    elements.output.value = translated;

    // Debounce history addition to avoid adding on every single character stroke
    clearTimeout(historySaveTimeout);
    historySaveTimeout = setTimeout(() => {
        if (text && translated) {
            addToHistory(text, translated);
        }
    }, 1200);
}

function morseToText(morse) {
    return morse.split("/").map(word => 
        word.trim().split(" ")
           .map(symbol => reverseMorseCode[symbol] || symbol)
           .join("")
    ).join(" ");
}

function textToMorse(text) {
    return text.toUpperCase().split(" ").map(word => 
        word.split("").map(char => morseCode[char] || char).join(" ")
    ).join("/");
}

// History Functions
function addToHistory(input, output) {
    if (!translationHistory.some(item => item.input === input && item.output === output)) {
        translationHistory.unshift({ input, output, timestamp: new Date().toLocaleString() });
        translationHistory = translationHistory.slice(0, 10);
        localStorage.setItem('morseHistory', JSON.stringify(translationHistory));
        updateHistoryDisplay();
    }
}

function updateHistoryDisplay() {
    if (!elements.history.list) return;
    elements.history.list.innerHTML = translationHistory.map(item => `
        <div class="history-item">
            <div>${item.input}</div>
            <div>→ ${item.output}</div>
            <small>${item.timestamp}</small>
        </div>
    `).join('') || '<div class="history-item">No history yet</div>';
}

// Morse Sound & Visual Flasher Player
function stopMorseSound() {
    if (currentAudioCtx) {
        try {
            currentAudioCtx.close();
        } catch (e) {
            console.error(e);
        }
        currentAudioCtx = null;
    }
    isAudioPlaying = false;
    if (elements.test) elements.test.classList.remove('playing');
    if (elements.flasher) elements.flasher.classList.remove('active');
}

function playMorseSound(code) {
    if (isAudioPlaying) {
        stopMorseSound();
        return;
    }

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    currentAudioCtx = ctx;
    isAudioPlaying = true;
    
    if (elements.test) elements.test.classList.add('playing');

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain).connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 600;
    
    let time = ctx.currentTime;
    const timing = { '.': 0.1, '-': 0.3, ' ': 0.3, '/': 0.7 };
    
    const chars = code.split('');
    osc.start(time);

    chars.forEach(char => {
        if (!isAudioPlaying) return;
        if (char === '.' || char === '-') {
            gain.gain.setValueAtTime(1, time);
            
            // Visual flasher sync
            const delayStart = (time - ctx.currentTime) * 1000;
            const duration = timing[char] * 1000;
            
            setTimeout(() => {
                if (isAudioPlaying && elements.flasher) elements.flasher.classList.add('active');
            }, Math.max(0, delayStart));
            
            setTimeout(() => {
                if (elements.flasher) elements.flasher.classList.remove('active');
            }, Math.max(0, delayStart + duration));

            time += timing[char];
            gain.gain.setValueAtTime(0, time);
            time += 0.1;
        } else if (timing[char]) {
            time += timing[char] - 0.1;
        }
    });

    const totalDuration = (time - ctx.currentTime) * 1000;
    osc.stop(time);

    setTimeout(() => {
        if (currentAudioCtx === ctx) {
            stopMorseSound();
        }
    }, Math.max(0, totalDuration + 100));
}

// Cheat Sheet Population & Setup
function initCheatSheet() {
    if (!elements.cheatGrid) return;
    elements.cheatGrid.innerHTML = Object.entries(morseCode).map(([char, code]) => `
        <div class="cheat-item">
            <span class="char">${char}</span>
            <span class="code">${code}</span>
        </div>
    `).join('');
}

// Event Listeners
function setupEventListeners() {
    validateInput();
    
    // Auto-translate on input
    elements.input.addEventListener('input', () => {
        translateText();
    });

    elements.copy.addEventListener("click", () => {
        if (!elements.output.value) return;
        elements.output.select();
        document.execCommand("copy");
        elements.copy.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => elements.copy.innerHTML = '<i class="far fa-copy"></i>', 2000);
    });

    elements.test.addEventListener("click", () => {
        if (elements.output.value) {
            playMorseSound(elements.output.value);
        }
    });

    elements.reverse.addEventListener("click", () => {
        if (elements.input.value || elements.output.value) {
            [elements.input.value, elements.output.value] = [elements.output.value, elements.input.value];
            elements.reverse.classList.add('active');
            setTimeout(() => elements.reverse.classList.remove('active'), 1000);
            translateText();
        }
    });

    // Cheat Sheet Modal Events
    if (elements.cheatBtn) {
        elements.cheatBtn.addEventListener('click', () => {
            elements.cheatModal.classList.remove('hidden');
        });
    }

    if (elements.closeCheatModal) {
        elements.closeCheatModal.addEventListener('click', () => {
            elements.cheatModal.classList.add('hidden');
        });
    }

    if (elements.cheatModal) {
        elements.cheatModal.addEventListener('click', (e) => {
            if (e.target === elements.cheatModal) {
                elements.cheatModal.classList.add('hidden');
            }
        });
    }

    elements.history.show.addEventListener('click', () => {
        elements.history.panel.classList.toggle('hidden');
        if (!elements.history.panel.classList.contains('hidden')) updateHistoryDisplay();
    });

    elements.history.clear.addEventListener('click', () => {
        translationHistory = [];
        localStorage.removeItem('morseHistory');
        updateHistoryDisplay();
    });
}

// Initialization
function init() {
    // Loader animation
    setTimeout(() => {
        document.querySelector('.loader').style.opacity = '0';
        setTimeout(() => document.querySelector('.loader').style.display = 'none', 500);
    }, 2500);
    
    // Setup cheat sheet grid
    initCheatSheet();

    // Setup all event listeners
    setupEventListeners();
    
    // Update history display
    updateHistoryDisplay();
}

window.addEventListener('load', init);
