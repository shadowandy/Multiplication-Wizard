const state = {
    questions: [],
    currentIndex: 0,
    score: 0,
    startTime: null,
    endTime: null,
    timerInterval: null
};

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultsScreen = document.getElementById('results-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const counterText = document.getElementById('question-counter');
const timerText = document.getElementById('timer');
const optionsContainer = document.getElementById('options-container');
const optionButtons = document.querySelectorAll('.option-btn');
const feedbackOverlay = document.getElementById('feedback-overlay');
const feedbackText = document.getElementById('feedback-text');
const resultsBody = document.getElementById('results-body');
const finalScore = document.getElementById('final-score');
const finalTime = document.getElementById('final-time');

// Initialize
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function startGame() {
    state.questions = generateQuestions(10);
    state.currentIndex = 0;
    state.score = 0;
    state.startTime = Date.now();
    
    showScreen('game');
    updateTimer();
    state.timerInterval = setInterval(updateTimer, 1000);
    loadQuestion();
}

function generateQuestions(count) {
    const questions = [];
    for (let i = 0; i < count; i++) {
        const base = Math.floor(Math.random() * 11) + 2; // 2 to 12
        const multiplier = Math.floor(Math.random() * 12) + 1; // 1 to 12
        const answer = base * multiplier;
        
        const options = generateOptions(base, multiplier, answer);
        
        questions.push({
            q: `${base} × ${multiplier}`,
            a: answer,
            options: options,
            userChoice: null
        });
    }
    return questions;
}

function generateOptions(base, multiplier, answer) {
    const options = new Set();
    options.add(answer);
    
    while (options.size < 4) {
        let distractor;
        const type = Math.floor(Math.random() * 4);
        
        switch (type) {
            case 0: // Close to answer
                distractor = answer + (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
                break;
            case 1: // Base * (multiplier +/- 1)
                distractor = base * (multiplier + (Math.random() < 0.5 ? 1 : -1));
                break;
            case 2: // (base +/- 1) * multiplier
                distractor = (base + (Math.random() < 0.5 ? 1 : -1)) * multiplier;
                break;
            default: // Random plausible number
                distractor = (Math.floor(Math.random() * 11) + 2) * (Math.floor(Math.random() * 12) + 1);
        }
        
        if (distractor > 0 && distractor !== answer) {
            options.add(distractor);
        }
    }
    
    return Array.from(options).sort(() => Math.random() - 0.5);
}

function loadQuestion() {
    const current = state.questions[state.currentIndex];
    questionText.textContent = `${current.q} = ?`;
    counterText.textContent = `Question ${state.currentIndex + 1} / 10`;
    
    optionButtons.forEach((btn, index) => {
        btn.textContent = current.options[index];
        btn.className = 'option-btn'; // Reset classes
        btn.disabled = false;
        btn.onclick = () => handleChoice(current.options[index], btn);
    });
}

function handleChoice(choice, btn) {
    const current = state.questions[state.currentIndex];
    current.userChoice = choice;
    
    // Disable all buttons immediately
    optionButtons.forEach(b => b.disabled = true);
    
    feedbackOverlay.classList.remove('hidden');
    
    if (choice === current.a) {
        state.score++;
        btn.classList.add('correct');
        const msg = 'Good Job!';
        feedbackText.textContent = `🌟 ${msg} 🌟`;
        feedbackText.className = 'feedback-correct';
        speak(msg);
    } else {
        btn.classList.add('wrong');
        const msg = 'Good Try!';
        feedbackText.textContent = `💪 ${msg} 💪`;
        feedbackText.className = 'feedback-wrong';
        speak(msg);
        // Show the correct one too
        optionButtons.forEach(b => {
            if (parseInt(b.textContent) === current.a) {
                b.classList.add('correct');
            }
        });
    }
    
    setTimeout(() => {
        feedbackOverlay.classList.add('hidden');
        state.currentIndex++;
        if (state.currentIndex < 10) {
            loadQuestion();
        } else {
            endGame();
        }
    }, 1200);
}

let preferredVoice = null;

function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return;

    // A comprehensive list of known female voice names across different OS and browsers
    const femaleNames = [
        'samantha', 'victoria', 'kathy', 'vicki', 'princess', 'karen', 'moira', 'tessa', 'veena', // macOS / iOS
        'zira', 'hazel', 'elsa', 'maria', 'linda', 'susan', // Windows
        'female', 'google us english female', 'google uk english female', 'en-us-x-sfg#female' // Google / Android
    ];

    // Try to find the best match from our prioritized list
    for (const name of femaleNames) {
        const match = voices.find(v => v.name.toLowerCase().includes(name));
        if (match) {
            preferredVoice = match;
            break;
        }
    }

    // If no specific female name matches, fallback to anything containing "female" 
    // or just use the first available English voice
    if (!preferredVoice) {
        preferredVoice = voices.find(v => v.name.toLowerCase().includes('female')) || 
                         voices.find(v => v.lang.startsWith('en')) || 
                         voices[0];
    }
}

// Initialize voices
if ('speechSynthesis' in window) {
    // Chrome/Edge load voices asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;
    // Safari/Firefox might have them ready immediately
    loadVoices();
}

function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Use preloaded voice if available, otherwise try to load again
        if (!preferredVoice) loadVoices();
        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.pitch = 1.2;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    }
}

function endGame() {
    state.endTime = Date.now();
    clearInterval(state.timerInterval);
    
    const timeDiff = Math.floor((state.endTime - state.startTime) / 1000);
    const minutes = Math.floor(timeDiff / 60);
    const seconds = timeDiff % 60;
    
    finalScore.textContent = `${state.score} / 10`;
    finalTime.textContent = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    
    renderResults();
    showScreen('results');
}

function renderResults() {
    resultsBody.innerHTML = '';
    state.questions.forEach(q => {
        const row = document.createElement('tr');
        const isCorrect = q.userChoice === q.a;
        
        row.innerHTML = `
            <td>${q.q}</td>
            <td class="${isCorrect ? '' : 'res-wrong'}">${q.userChoice}</td>
            <td>${q.a}</td>
            <td class="${isCorrect ? 'res-correct' : 'res-wrong'}">${isCorrect ? '✅' : '❌'}</td>
        `;
        resultsBody.appendChild(row);
    });
}

function updateTimer() {
    const diff = Math.floor((Date.now() - state.startTime) / 1000);
    const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
    const seconds = (diff % 60).toString().padStart(2, '0');
    timerText.textContent = `${minutes}:${seconds}`;
}

function showScreen(screenName) {
    [startScreen, gameScreen, resultsScreen].forEach(s => s.classList.add('hidden'));
    
    if (screenName === 'start') startScreen.classList.remove('hidden');
    if (screenName === 'game') gameScreen.classList.remove('hidden');
    if (screenName === 'results') resultsScreen.classList.remove('hidden');
}
