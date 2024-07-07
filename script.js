// Script pour la page d'accueil (index.html)

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("vocabulary-form");
    const addEntryBtn = document.getElementById("add-entry-btn");
    const fileInput = document.getElementById("file-input");
    const modal = document.getElementById("error-modal");
    const span = document.getElementsByClassName("close")[0];
    const errorMessage = document.getElementById("error-message");

    addEntryBtn.addEventListener("click", () => {
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("entry");
        entryDiv.innerHTML = `
            <input type="text" placeholder="English word(s), separated by commas" class="english-word">
            <input type="text" placeholder="French word(s), separated by commas" class="french-word">
        `;
        document.getElementById("vocabulary-entries").appendChild(entryDiv);
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const englishWords = document.querySelectorAll(".english-word");
        const frenchWords = document.querySelectorAll(".french-word");

        let vocabulary = [];
        for (let i = 0; i < englishWords.length; i++) {
            let english = englishWords[i].value.trim();
            let french = frenchWords[i].value.trim();
            if (english && french) {
                vocabulary.push({ english: english.split(',').map(word => word.trim()), french: french.split(',').map(word => word.trim()) });
            }
        }

        localStorage.setItem("vocabulary", JSON.stringify(vocabulary));
        window.location.href = "review.html";
    });

    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target.result;
            try {
                const importedVocabulary = JSON.parse(content);
                if (Array.isArray(importedVocabulary) && importedVocabulary.every(item => item.english && item.french)) {
                    localStorage.setItem("vocabulary", JSON.stringify(importedVocabulary));
                    window.location.href = "review.html";
                } else {
                    showErrorModal("Invalid JSON format. Please ensure the JSON file contains an array of objects with 'english' and 'french' properties.");
                }
            } catch (error) {
                showErrorModal("Invalid JSON file.");
            }
        };

        if (file) {
            reader.readAsText(file);
        }
    });

    function showErrorModal(message) {
        errorMessage.innerText = message;
        modal.style.display = "block";
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

// Script pour la page de révision (review.html)

if (window.location.pathname.includes("review.html")) {
    const vocabulary = JSON.parse(localStorage.getItem("vocabulary")) || [];
    let currentWord = {};
    let currentLanguage = '';
    let currentIndex = 0;
    let correctlyAnsweredWords = [];

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function showNextWord() {
        if (vocabulary.length === 0) return;

        let remainingWords = vocabulary.filter((_, index) => !correctlyAnsweredWords.includes(index));
        if (remainingWords.length === 0) {
            correctlyAnsweredWords = []; // Reset if all words are answered correctly
            remainingWords = vocabulary;
        }

        currentIndex = getRandomInt(remainingWords.length);
        currentWord = remainingWords[currentIndex];
        const actualIndex = vocabulary.indexOf(currentWord);
        currentLanguage = Math.random() >= 0.5 ? 'english' : 'french';

        const wordList = currentWord[currentLanguage];
        const wordDisplay = wordList.join(', ');  // Affiche tous les mots disponibles

        document.getElementById("word").innerText = wordDisplay;
        document.getElementById("answer-input").value = '';
        document.getElementById("result-message").innerText = '';
        currentIndex = actualIndex; // Store the actual index of the word
    }

    function checkAnswer() {
        const userAnswer = document.getElementById("answer-input").value.trim().toLowerCase();
        const userAnswers = userAnswer.split(',').map(answer => answer.trim());
        const correctAnswers = currentLanguage === 'english' ? currentWord.french : currentWord.english;
        const correctAnswersLower = correctAnswers.map(answer => answer.trim().toLowerCase());

        let allCorrect = true;
        for (let answer of userAnswers) {
            if (!correctAnswersLower.includes(answer)) {
                allCorrect = false;
                break;
            }
        }

        if (allCorrect) {
            document.getElementById("result-message").innerText = "Correct!";
            document.getElementById("result-message").style.color = "green";
            if (!correctlyAnsweredWords.includes(currentIndex)) {
                correctlyAnsweredWords.push(currentIndex);
            }
        } else {
            document.getElementById("result-message").innerText = `Incorrect! Possible correct answers are: ${correctAnswers.join(', ')}.`;
            document.getElementById("result-message").style.color = "red";
        }

        // Pass to the next word after 2 seconds
        setTimeout(showNextWord, 2000);
    }

    document.getElementById("submit-answer-btn").addEventListener("click", checkAnswer);

    // Show the first word on load
    showNextWord();
}
