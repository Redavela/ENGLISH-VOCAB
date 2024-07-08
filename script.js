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
        const wordContainer = document.getElementById("word");
        wordContainer.innerHTML = ''; // Clear previous words

        // Create a list of words
        const ul = document.createElement('ul');
        wordList.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            ul.appendChild(li);
        });
        wordContainer.appendChild(ul);

        document.getElementById("answer-input").value = '';
        document.getElementById("result-message").innerText = '';
        document.getElementById("warning-message").style.display = 'none';
        document.getElementById("submit-answer-btn").disabled = true;
        currentIndex = actualIndex; // Store the actual index of the word
    }

    function normalizeString(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
    }

    function checkAnswer() {
        const userAnswer = document.getElementById("answer-input").value.trim().toLowerCase();
        if (userAnswer === '' || !/[a-zA-Z0-9]/.test(userAnswer)) {
            document.getElementById("warning-message").style.display = 'block';
            return;
        }

        document.getElementById("warning-message").style.display = 'none';
        const userAnswers = userAnswer.split(',').map(answer => normalizeString(answer.trim()));
        const correctAnswers = currentLanguage === 'english' ? currentWord.french : currentWord.english;
        const correctAnswersLower = correctAnswers.map(answer => normalizeString(answer.trim().toLowerCase()));

        let allCorrect = true;
        let hasIncorrectAnswer = false;
        let missingAnswers = [];

        // Check for correct and missing answers
        userAnswers.forEach(answer => {
            if (!correctAnswersLower.includes(answer)) {
                hasIncorrectAnswer = true;
            }
        });

        correctAnswersLower.forEach(answer => {
            if (!userAnswers.includes(answer)) {
                missingAnswers.push(answer);
                allCorrect = false;
            }
        });

        // Disable the submit button and input field during the 3-second timeout
        document.getElementById("submit-answer-btn").disabled = true;
        document.getElementById("answer-input").disabled = true;

        if (!hasIncorrectAnswer && userAnswers.length === correctAnswersLower.length && allCorrect) {
            document.getElementById("result-message").innerText = "Correct!";
            document.getElementById("result-message").style.color = "green";
            if (!correctlyAnsweredWords.includes(currentIndex)) {
                correctlyAnsweredWords.push(currentIndex);
            }
        } else if (!hasIncorrectAnswer && userAnswers.length < correctAnswersLower.length) {
            let missingAnswersMessage = '';
            if (missingAnswers.length > 0) {
                missingAnswersMessage = ` You could have also said: <ul>${missingAnswers.map(answer => `<li>${correctAnswers[correctAnswersLower.indexOf(answer)]}</li>`).join('')}</ul>`;
            }
            document.getElementById("result-message").innerHTML = `Correct!${missingAnswersMessage}`;
            document.getElementById("result-message").style.color = "orange";
            if (!correctlyAnsweredWords.includes(currentIndex)) {
                correctlyAnsweredWords.push(currentIndex);
            }
        } else {
            document.getElementById("result-message").innerHTML = `Incorrect! Possible correct answers are: <ul>${correctAnswers.map(answer => `<li>${answer}</li>`).join('')}</ul>`;
            document.getElementById("result-message").style.color = "red";
        }

        // Re-enable the submit button and input field after 3 seconds
        setTimeout(() => {
            document.getElementById("submit-answer-btn").disabled = false;
            document.getElementById("answer-input").disabled = false;
            showNextWord();
        }, 3000);
    }

    document.getElementById("submit-answer-btn").addEventListener("click", () => {
        const userInput = document.getElementById("answer-input").value.trim();
        if (userInput === '') {
            document.getElementById("warning-message").style.display = 'block';
        } else {
            checkAnswer();
        }
    });

    // Enable the submit button if there is input
    document.getElementById("answer-input").addEventListener("input", function() {
        const userInput = document.getElementById("answer-input").value.trim();
        document.getElementById("submit-answer-btn").disabled = userInput === '';
    });

    // Add event listener for Enter key
    document.getElementById("answer-input").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const userInput = document.getElementById("answer-input").value.trim();
            if (userInput === '') {
                document.getElementById("warning-message").style.display = 'block';
            } else {
                checkAnswer();
            }
        }
    });

    // Show the first word on load
    showNextWord();
}
