// Script pour la page d'accueil (index.html)

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("vocabulary-form");
    const addEntryBtn = document.getElementById("add-entry-btn");
    const fileInput = document.getElementById("file-input");
    const modal = document.getElementById("error-modal");
    const span = document.getElementsByClassName("close")[0];
    const errorMessage = document.getElementById("error-message");
    const messageContainer = document.createElement("div");
    messageContainer.id = "message-container";
    document.getElementById("vocabulary-entries").appendChild(messageContainer);

    // Effacer les anciens enregistrements de vocabulaire au chargement de la page
    localStorage.removeItem("vocabulary");

    let vocabulary = [];

    // Fonction pour vérifier si les champs sont remplis
    function checkFields() {
        const englishWords = document.querySelector(".english-word").value.trim();
        const frenchWords = document.querySelector(".french-word").value.trim();
    }

    function showMessage(message, isError = false) {
        messageContainer.innerText = message;
        messageContainer.style.color = isError ? "red" : "blue";
        setTimeout(() => {
            messageContainer.innerText = "";
        }, 3000);
    }

    function addEntry() {
        const englishInput = document.querySelector(".english-word").value.trim();
        const frenchInput = document.querySelector(".french-word").value.trim();

        if (englishInput === "" || frenchInput === "") {
            showMessage("Both fields must be filled to add vocabulary.", true);
            return;
        }

        // Ajouter les mots au vocabulaire
        vocabulary.push({
            english: englishInput.split(',').map(word => word.trim()),
            french: frenchInput.split(',').map(word => word.trim())
        });

        // Stocker le vocabulaire mis à jour dans le localStorage
        localStorage.setItem("vocabulary", JSON.stringify(vocabulary));

        // Afficher un message de confirmation avec les mots ajoutés
        showMessage(`Added: English: ${englishInput}, French: ${frenchInput}`);

        // Vider les champs d'entrée
        document.querySelector(".english-word").value = "";
        document.querySelector(".french-word").value = "";

        // Désactiver le bouton pendant 2,5 secondes
        addEntryBtn.disabled = true;
        setTimeout(() => {
            addEntryBtn.disabled = false; // Réactiver le bouton après 2,5 secondes
            checkFields(); // Recheck fields to enable button if necessary
        }, 2500);
    }

    addEntryBtn.addEventListener("click", addEntry);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

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
                    vocabulary = importedVocabulary;
                    localStorage.setItem("vocabulary", JSON.stringify(vocabulary));
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

    // Ajout des écouteurs d'événements initiaux pour vérifier les champs à chaque entrée de texte
    const initialEnglishInput = document.querySelector(".english-word");
    const initialFrenchInput = document.querySelector(".french-word");

    initialEnglishInput.addEventListener("input", checkFields);
    initialFrenchInput.addEventListener("input", checkFields);

    initialEnglishInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addEntry();
        }
    });

    initialFrenchInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addEntry();
        }
    });

    // Vérification initiale des champs pour désactiver le bouton si nécessaire
    addEntryBtn.disabled = false;
    checkFields();
});
