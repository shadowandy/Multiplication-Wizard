# Multiplication Wizard 🧙‍♂️✨

Multiplication Wizard is a fun, interactive web application designed to help primary school children master their multiplication tables. It turns learning into an engaging game, providing immediate feedback and a sense of accomplishment.

## 📸 Screenshots

### Start Screen
<img src="imgs/multiplication-wizard-1.png" alt="Start Screen" width="400">

### Gameplay
<img src="imgs/multiplication-wizard-2.png" alt="Gameplay" width="400">

### Results Summary
<img src="imgs/multiplication-wizard-3.png" alt="Results Summary" width="400">

## 🌟 Features

-   **Randomized Challenges:** Generates 10 unique multiplication questions per session, ranging from 2×1 up to 12×12.
-   **Smart Distractors:** Multiple-choice options are intelligently generated to include common pitfalls and near-misses, encouraging careful calculation.
-   **Interactive Feedback:**
    -   **Visuals:** Animations for correct and incorrect answers.
    -   **Auditory:** Encouraging voice feedback using speech synthesis (e.g., "Good Job!", "Good Try!").
-   **Performance Tracking:**
    -   **Live Timer:** Keeps track of how long the session takes.
    -   **Results Summary:** Shows the final score and time taken.
    -   **Detailed Review:** A table showing every question, the child's answer, and the correct answer for easy review and learning.
-   **Kid-Friendly Design:** Colorful, responsive interface that works great on both tablets and computers.

## 🚀 Getting Started

### Setup
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/shadowandy/Multiplication-Wizard.git
    ```
2.  **Navigate to the Directory:**
    ```bash
    cd Multiplication-Wizard
    ```
3.  **Run the App:**
    Simply open `index.html` in your favorite web browser. No local server or installation is required!

### How to Play
1.  Click **"Start Game"** to begin a session.
2.  Select the correct answer from the four choices provided.
3.  Review your performance on the **Results Screen** to see your score, time, and a detailed breakdown of each question.

## ⚙️ Customization

You can easily tailor the game to your child's learning level by modifying the `CONFIG` object at the top of `script.js`.

```javascript
const CONFIG = {
    TOTAL_QUESTIONS: 10,       // Number of questions per round
    RANGES: {
        BASE: { MIN: 2, MAX: 12 },       // The main number being multiplied
        MULTIPLIER: { MIN: 1, MAX: 12 }  // The range of the multiplier
    },
    DELAY: {
        FEEDBACK: 1200         // Time (ms) to show feedback before next question
    },
    MESSAGES: {
        CORRECT: 'Good Job!',  // Audio/Visual message for correct answers
        WRONG: 'Good Try!'     // Audio/Visual message for incorrect answers
    }
};
```

### Examples:
- **Focus on 5 times table:** Set `BASE: { MIN: 5, MAX: 5 }`.
- **Easier Mode:** Set `MULTIPLIER: { MIN: 1, MAX: 5 }` and `TOTAL_QUESTIONS: 5`.
- **Challenge Mode:** Set `BASE: { MIN: 12, MAX: 15 }`.

## 🛠️ Technology Stack

-   **HTML5:** Structure and content.
-   **Vanilla CSS:** Modern, responsive styling with CSS variables and animations.
-   **Vanilla JavaScript:** Game logic, state management, and Web Speech API integration.

## 👨‍👩‍👧‍👦 Why I Built This

I created Multiplication Wizard as a tool for my primary school children. I wanted to provide them with a way to practice their math skills that felt more like a game than a chore. By adding elements like a timer, colorful feedback, and speech synthesis, it makes the repetitive task of learning multiplication tables much more enjoyable and effective.
