// Script pour la page de révision (review.html)

document.addEventListener("DOMContentLoaded", () => {
    const vocabulary = JSON.parse(localStorage.getItem("vocabulary")) || [];
    let currentWord = {};
    let currentLanguage = '';
    let currentIndex = 0;
    let correctlyAnsweredWords = new Set();
    let incorrectlyAnsweredWords = new Set();

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function showNextWord() {
        if (vocabulary.length === 0) return;

        let remainingWords = vocabulary.filter((_, index) => !correctlyAnsweredWords.has(index));

        // If all words have been answered correctly and no incorrect words, reset the lists
        if (remainingWords.length === 0 && incorrectlyAnsweredWords.size === 0) {
            correctlyAnsweredWords.clear();
            remainingWords = vocabulary;
        } else if (remainingWords.length === 0) {
            remainingWords = vocabulary.filter((_, index) => incorrectlyAnsweredWords.has(index));
        }

        currentIndex = getRandomInt(remainingWords.length);
        currentWord = remainingWords[currentIndex];
        const actualIndex = vocabulary.indexOf(currentWord);
        currentLanguage = Math.random() >= 0.5 ? 'english' : 'french';

        const wordList = currentWord[currentLanguage];
        const wordContainer = document.getElementById("word");
        wordContainer.innerHTML = ''; // Clear previous words

        // Create a list of words
        const ul = document.createElement("ul");
        wordList.forEach(word => {
            const li = document.createElement("li");
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

        // Disable the submit button and input field during the 2.5-second timeout
        document.getElementById("submit-answer-btn").disabled = true;
        document.getElementById("answer-input").disabled = true;

        if (!hasIncorrectAnswer && userAnswers.length === correctAnswersLower.length && allCorrect) {
            document.getElementById("result-message").innerText = "Correct!";
            document.getElementById("result-message").style.color = "green";
            correctlyAnsweredWords.add(currentIndex);
            incorrectlyAnsweredWords.delete(currentIndex);
        } else if (!hasIncorrectAnswer && userAnswers.length < correctAnswersLower.length) {
            let missingAnswersMessage = '';
            if (missingAnswers.length > 0) {
                missingAnswersMessage = ` You could have also said: <ul>${missingAnswers.map(answer => `<li>${correctAnswers[correctAnswersLower.indexOf(answer)]}</li>`).join('')}</ul>`;
            }
            document.getElementById("result-message").innerHTML = `Correct!${missingAnswersMessage}`;
            document.getElementById("result-message").style.color = "orange";
            correctlyAnsweredWords.add(currentIndex);
            incorrectlyAnsweredWords.delete(currentIndex);
        } else {
            document.getElementById("result-message").innerHTML = `Incorrect! Possible correct answers are: <ul>${correctAnswers.map(answer => `<li>${answer}</li>`).join('')}</ul>`;
            document.getElementById("result-message").style.color = "red";
            incorrectlyAnsweredWords.add(currentIndex);
        }

        // Re-enable the submit button and input field after 2.5 seconds
        setTimeout(() => {
            document.getElementById("submit-answer-btn").disabled = false;
            document.getElementById("answer-input").disabled = false;
            showNextWord();
        }, 2500);
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
});
