/**
 * Multiplication Wizard - Refactored
 * A fun, interactive multiplication game for kids.
 */

const CONFIG = {
    TOTAL_QUESTIONS: 10,
    RANGES: {
        BASE: { MIN: 2, MAX: 12 },
        MULTIPLIER: { MIN: 1, MAX: 12 }
    },
    DELAY: {
        FEEDBACK: 1200
    },
    MESSAGES: {
        CORRECT: 'Good Job!',
        WRONG: 'Good Try!'
    }
};

/**
 * Handles all speech synthesis features.
 */
const AudioService = {
    preferredVoice: null,

    init() {
        if (!('speechSynthesis' in window)) return;
        
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) return;

            const femaleNames = [
                'samantha', 'victoria', 'kathy', 'vicki', 'princess', 'karen', 'moira', 'tessa', 'veena',
                'zira', 'hazel', 'elsa', 'maria', 'linda', 'susan',
                'female', 'google us english female', 'google uk english female', 'en-us-x-sfg#female'
            ];

            for (const name of femaleNames) {
                const match = voices.find(v => v.name.toLowerCase().includes(name));
                if (match) {
                    this.preferredVoice = match;
                    break;
                }
            }

            if (!this.preferredVoice) {
                this.preferredVoice = voices.find(v => v.name.toLowerCase().includes('female')) || 
                                     voices.find(v => v.lang.startsWith('en')) || 
                                     voices[0];
            }
        };

        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    },

    speak(text) {
        if (!('speechSynthesis' in window)) return;
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (this.preferredVoice) utterance.voice = this.preferredVoice;
        utterance.pitch = 1.2;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    }
};

/**
 * Manages the core game logic and state.
 */
class GameEngine {
    constructor() {
        this.reset();
    }

    reset() {
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.startTime = null;
        this.endTime = null;
    }

    initGame() {
        this.reset();
        this.startTime = Date.now();
        this.questions = this.generateQuestions(CONFIG.TOTAL_QUESTIONS);
    }

    generateQuestions(count) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            const base = Math.floor(Math.random() * (CONFIG.RANGES.BASE.MAX - CONFIG.RANGES.BASE.MIN + 1)) + CONFIG.RANGES.BASE.MIN;
            const multiplier = Math.floor(Math.random() * (CONFIG.RANGES.MULTIPLIER.MAX - CONFIG.RANGES.MULTIPLIER.MIN + 1)) + CONFIG.RANGES.MULTIPLIER.MIN;
            const answer = base * multiplier;
            
            questions.push({
                q: `${base} × ${multiplier}`,
                a: answer,
                options: this.generateOptions(base, multiplier, answer),
                userChoice: null
            });
        }
        return questions;
    }

    generateOptions(base, multiplier, answer) {
        const options = new Set([answer]);
        
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
                    distractor = (Math.floor(Math.random() * (CONFIG.RANGES.BASE.MAX - CONFIG.RANGES.BASE.MIN + 1)) + CONFIG.RANGES.BASE.MIN) * 
                                 (Math.floor(Math.random() * (CONFIG.RANGES.MULTIPLIER.MAX - CONFIG.RANGES.MULTIPLIER.MIN + 1)) + CONFIG.RANGES.MULTIPLIER.MIN);
            }
            
            if (distractor > 0 && distractor !== answer) options.add(distractor);
        }
        
        return Array.from(options).sort(() => Math.random() - 0.5);
    }

    checkAnswer(choice) {
        const current = this.questions[this.currentIndex];
        current.userChoice = choice;
        const isCorrect = choice === current.a;
        if (isCorrect) this.score++;
        return { isCorrect, correctAnswer: current.a };
    }

    nextQuestion() {
        this.currentIndex++;
        return this.currentIndex < CONFIG.TOTAL_QUESTIONS;
    }

    endGame() {
        this.endTime = Date.now();
    }

    getSummary() {
        const timeDiff = Math.floor((this.endTime - this.startTime) / 1000);
        const minutes = Math.floor(timeDiff / 60);
        const seconds = timeDiff % 60;
        return {
            score: this.score,
            total: CONFIG.TOTAL_QUESTIONS,
            timeSeconds: timeDiff,
            timeFormatted: minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`,
            questions: this.questions
        };
    }
}

/**
 * Handles all DOM interactions and rendering.
 */
const UIController = {
    elements: {},
    timerInterval: null,
    engine: null,

    init(engine) {
        this.engine = engine;
        this.cacheElements();
        this.bindEvents();
    },

    cacheElements() {
        const ids = [
            'start-screen', 'game-screen', 'results-screen',
            'start-btn', 'restart-btn', 'question-text',
            'question-counter', 'timer', 'options-container',
            'feedback-overlay', 'feedback-text', 'results-body',
            'final-score', 'final-time'
        ];
        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
        this.elements.optionButtons = document.querySelectorAll('.option-btn');
    },

    bindEvents() {
        this.elements['start-btn'].addEventListener('click', () => this.handleStart());
        this.elements['restart-btn'].addEventListener('click', () => this.handleStart());
        
        this.elements.optionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const choice = parseInt(btn.textContent);
                this.handleChoice(choice, btn);
            });
        });
    },

    handleStart() {
        this.engine.initGame();
        this.showScreen('game');
        this.startTimer();
        this.renderQuestion();
    },

    handleChoice(choice, btn) {
        const { isCorrect, correctAnswer } = this.engine.checkAnswer(choice);
        
        // Disable buttons
        this.elements.optionButtons.forEach(b => b.disabled = true);
        
        this.renderFeedback(isCorrect, btn, correctAnswer);
        AudioService.speak(isCorrect ? CONFIG.MESSAGES.CORRECT : CONFIG.MESSAGES.WRONG);

        setTimeout(() => {
            this.elements['feedback-overlay'].classList.add('hidden');
            if (this.engine.nextQuestion()) {
                this.renderQuestion();
            } else {
                this.handleEnd();
            }
        }, CONFIG.DELAY.FEEDBACK);
    },

    handleEnd() {
        this.engine.endGame();
        this.stopTimer();
        this.renderResults();
        this.showScreen('results');
    },

    renderQuestion() {
        const current = this.engine.questions[this.engine.currentIndex];
        this.elements['question-text'].textContent = `${current.q} = ?`;
        this.elements['question-counter'].textContent = `Question ${this.engine.currentIndex + 1} / ${CONFIG.TOTAL_QUESTIONS}`;
        
        this.elements.optionButtons.forEach((btn, index) => {
            btn.textContent = current.options[index];
            btn.className = 'option-btn';
            btn.disabled = false;
        });
    },

    renderFeedback(isCorrect, btn, correctAnswer) {
        this.elements['feedback-overlay'].classList.remove('hidden');
        const textElement = this.elements['feedback-text'];
        
        if (isCorrect) {
            btn.classList.add('correct');
            textElement.textContent = `🌟 ${CONFIG.MESSAGES.CORRECT} 🌟`;
            textElement.className = 'feedback-correct';
        } else {
            btn.classList.add('wrong');
            textElement.textContent = `💪 ${CONFIG.MESSAGES.WRONG} 💪`;
            textElement.className = 'feedback-wrong';
            // Highlight correct answer
            this.elements.optionButtons.forEach(b => {
                if (parseInt(b.textContent) === correctAnswer) b.classList.add('correct');
            });
        }
    },

    renderResults() {
        const summary = this.engine.getSummary();
        this.elements['final-score'].textContent = `${summary.score} / ${summary.total}`;
        this.elements['final-time'].textContent = summary.timeFormatted;
        
        const tbody = this.elements['results-body'];
        tbody.innerHTML = '';
        
        summary.questions.forEach(q => {
            const isCorrect = q.userChoice === q.a;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${q.q}</td>
                <td class="${isCorrect ? '' : 'res-wrong'}">${q.userChoice}</td>
                <td>${q.a}</td>
                <td class="${isCorrect ? 'res-correct' : 'res-wrong'}">${isCorrect ? '✅' : '❌'}</td>
            `;
            tbody.appendChild(row);
        });
    },

    showScreen(screenName) {
        ['start-screen', 'game-screen', 'results-screen'].forEach(id => {
            if (this.elements[id]) this.elements[id].classList.add('hidden');
        });
        if (this.elements[`${screenName}-screen`]) {
            this.elements[`${screenName}-screen`].classList.remove('hidden');
        }
    },

    startTimer() {
        this.stopTimer();
        const update = () => {
            const diff = Math.floor((Date.now() - this.engine.startTime) / 1000);
            const m = Math.floor(diff / 60).toString().padStart(2, '0');
            const s = (diff % 60).toString().padStart(2, '0');
            this.elements['timer'].textContent = `${m}:${s}`;
        };
        update();
        this.timerInterval = setInterval(update, 1000);
    },

    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
};

// Initialize App
const engine = new GameEngine();
AudioService.init();
UIController.init(engine);
